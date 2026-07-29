import { emailDefaults, resend } from '@/lib/email/resend';
import { notificationEmail } from '@/lib/email/templates';
import { publicEnv } from '@/lib/env/public-env';
import { env } from '@/lib/env/server-env';
import { type RegistryType, registryVerificationUpdate, verifyAssociationRegistry } from '@/lib/registry/verification';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

import 'server-only';

type RegistryRefreshAssociation = {
  id: string;
  common_name: string | null;
  contact_email: string | null;
  contact_notification_opt_in_status: 'confirmed' | 'pending' | 'withdrawn' | null;
  name: string | null;
  official_name: string | null;
  primary_language: 'en' | 'fr' | 'fr_en' | null;
  registry_number: string | null;
  registry_type: RegistryType | null;
  verification_status: 'needs_review' | 'unverified' | 'verified';
};

export type RegistryRefreshResult = {
  checked: number;
  failed: number;
  notified: number;
  skipped: boolean;
  skippedProvider: number;
  updated: number;
};

const DEFAULT_REFRESH_LIMIT = 50;

function providerConfigured(registryType: RegistryType | null): boolean {
  if (registryType === 'neq') {
    return env.REQ_REGISTRY_DATA_URL !== undefined;
  }

  if (registryType === 'federal') {
    return env.FEDERAL_REGISTRY_DATA_URL !== undefined;
  }

  return false;
}

function displayName(row: RegistryRefreshAssociation): string {
  return row.common_name ?? row.official_name ?? row.name ?? 'Kamga';
}

function rowLocale(row: RegistryRefreshAssociation): 'en' | 'fr' {
  return row.primary_language === 'en' ? 'en' : 'fr';
}

async function notifyVerificationStatusChange(params: {
  association: RegistryRefreshAssociation;
  nextStatus: 'needs_review' | 'unverified' | 'verified';
}): Promise<boolean> {
  if (
    params.association.contact_email === null ||
    params.association.contact_notification_opt_in_status !== 'confirmed' ||
    params.association.verification_status === params.nextStatus
  ) {
    return false;
  }

  const locale = rowLocale(params.association);
  const associationName = displayName(params.association);
  const title = locale === 'fr' ? 'Statut de vérification de votre fiche' : 'Your listing verification status';
  const body = locale === 'fr'
    ? params.nextStatus === 'verified'
      ? `La fiche ${associationName} affiche maintenant le badge vérifié dans l'annuaire Kamga.`
      : `La vérification de la fiche ${associationName} doit être revue. Le badge public est retiré jusqu'à résolution.`
    : params.nextStatus === 'verified'
      ? `The ${associationName} listing now displays the verified badge in the Kamga directory.`
      : `The ${associationName} listing verification needs review. The public badge is removed until it is resolved.`;
  const template = notificationEmail({
    body,
    ctaUrl: new URL(`/${locale}/dashboard/associations`, publicEnv.NEXT_PUBLIC_APP_URL).toString(),
    locale,
    title
  });

  await resend.emails.send({
    from: emailDefaults.from,
    html: template.html,
    subject: template.subject,
    text: template.text,
    to: params.association.contact_email
  });

  return true;
}

export async function refreshRegistryVerifications(limit = DEFAULT_REFRESH_LIMIT): Promise<RegistryRefreshResult> {
  const result: RegistryRefreshResult = {
    checked: 0,
    failed: 0,
    notified: 0,
    skipped: env.REQ_REGISTRY_DATA_URL === undefined && env.FEDERAL_REGISTRY_DATA_URL === undefined,
    skippedProvider: 0,
    updated: 0
  };

  if (result.skipped) {
    return result;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('associations')
    .select('id,common_name,contact_email,contact_notification_opt_in_status,name,official_name,primary_language,registry_number,registry_type,verification_status')
    .eq('status', 'active')
    .not('registry_number', 'is', null)
    .not('registry_type', 'is', null)
    .in('verification_status', ['verified', 'needs_review'])
    .order('registry_checked_at', { ascending: true, nullsFirst: true })
    .limit(Math.max(1, Math.min(limit, 200)));

  if (error) {
    return { ...result, failed: 1 };
  }

  const rows = (data ?? []) as RegistryRefreshAssociation[];

  for (const association of rows) {
    if (!providerConfigured(association.registry_type)) {
      result.skippedProvider += 1;
      continue;
    }

    result.checked += 1;
    const verification = await verifyAssociationRegistry({
      officialName: displayName(association),
      registryNumber: association.registry_number,
      registryType: association.registry_type
    });

    const update = registryVerificationUpdate(verification);
    const { error: updateError } = await supabase
      .from('associations')
      .update(update)
      .eq('id', association.id);

    if (updateError) {
      result.failed += 1;
      continue;
    }

    if (verification.status !== association.verification_status) {
      result.updated += 1;
      const notified = await notifyVerificationStatusChange({ association, nextStatus: verification.status }).catch(() => false);
      result.notified += notified ? 1 : 0;
    }
  }

  return result;
}
