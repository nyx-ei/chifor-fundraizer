import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Building2, Languages, MapPin, ShieldCheck } from 'lucide-react';
import { z } from 'zod';

import { RequestToConnectAssociationForm } from '@/features/associations';
import { ASSOCIATION_CLAIM_STATUSES, ASSOCIATION_PRIMARY_LANGUAGES, ASSOCIATION_PUBLIC_PRECISIONS, ASSOCIATION_VERIFICATION_STATUSES } from '@/features/associations/association-types';
import { Link } from '@/i18n/navigation';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const associationTableProfileSchema = z
  .object({
    claim_status: z.enum(ASSOCIATION_CLAIM_STATUSES).catch('unclaimed'),
    city: z.string().nullable().catch(null),
    common_name: z.string().nullable().catch(null),
    common_name_en: z.string().nullable().optional().catch(null),
    common_name_fr: z.string().nullable().optional().catch(null),
    contact_email: z.string().nullable().catch(null),
    description: z.string().nullable().catch(null),
    description_en: z.string().nullable().optional().catch(null),
    description_fr: z.string().nullable().optional().catch(null),
    id: z.string().uuid(),
    name: z.string().nullable().catch(null),
    official_name: z.string().nullable().catch(null),
    primary_language: z.enum(ASSOCIATION_PRIMARY_LANGUAGES).catch('fr_en'),
    province: z.string().nullable().catch(null),
    public_contact_email: z.boolean().catch(false),
    public_precision: z.enum(ASSOCIATION_PUBLIC_PRECISIONS).catch('neighbourhood'),
    status: z.string(),
    street_address: z.string().nullable().catch(null),
    verification_status: z.enum(ASSOCIATION_VERIFICATION_STATUSES).catch('unverified')
  })
  .passthrough();

type PublicAssociationProfile = {
  claim_status: (typeof ASSOCIATION_CLAIM_STATUSES)[number];
  city: string;
  description: string | null;
  description_en: string | null;
  description_fr: string | null;
  display_name: string;
  display_name_en: string;
  display_name_fr: string;
  id: string;
  primary_language: (typeof ASSOCIATION_PRIMARY_LANGUAGES)[number];
  province: string;
  public_contact_email: string | null;
  public_street_address: string | null;
  verification_status: (typeof ASSOCIATION_VERIFICATION_STATUSES)[number];
};

type AssociationProfilePageProps = {
  params: {
    associationId: string;
    locale: 'en' | 'fr';
  };
};

async function getPublicAssociationProfile(associationId: string) {
  const parsedId = z.string().uuid().safeParse(associationId);

  if (!parsedId.success) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('associations')
    .select('*')
    .eq('id', parsedId.data)
    .eq('status', 'active')
    .maybeSingle();

  if (error || data === null) {
    return null;
  }

  const association = associationTableProfileSchema.safeParse(data);

  if (!association.success || association.data.status !== 'active' || association.data.city === null || association.data.province === null) {
    return null;
  }

  const displayName = association.data.common_name ?? association.data.official_name ?? association.data.name;

  if (displayName === null) {
    return null;
  }

  return {
    claim_status: association.data.claim_status,
    city: association.data.city,
    description: association.data.description,
    description_en: association.data.description_en ?? association.data.description,
    description_fr: association.data.description_fr ?? association.data.description,
    display_name: displayName,
    display_name_en: association.data.common_name_en ?? displayName,
    display_name_fr: association.data.common_name_fr ?? displayName,
    id: association.data.id,
    primary_language: association.data.primary_language,
    province: association.data.province,
    public_contact_email: association.data.public_contact_email ? association.data.contact_email : null,
    public_street_address: association.data.public_precision === 'exact' ? association.data.street_address : null,
    verification_status: association.data.verification_status
  };
}

function localizedAssociationContent(association: PublicAssociationProfile, locale: 'en' | 'fr') {
  const displayName = locale === 'fr' ? association.display_name_fr : association.display_name_en;
  const localizedDescription = locale === 'fr' ? association.description_fr : association.description_en;
  const fallbackDescription = locale === 'fr' ? association.description_en : association.description_fr;

  return {
    description: localizedDescription ?? association.description ?? fallbackDescription,
    descriptionLocale:
      localizedDescription !== null ? locale : association.description !== null ? association.primary_language : fallbackDescription !== null ? (locale === 'fr' ? 'en' : 'fr') : locale,
    displayName: displayName ?? association.display_name
  };
}

export default async function AssociationProfilePage({ params }: AssociationProfilePageProps) {
  const association = await getPublicAssociationProfile(params.associationId);

  if (association === null) {
    notFound();
  }

  const t = await getTranslations('associations.profile');
  const content = localizedAssociationContent(association, params.locale);
  const fallbackLabel =
    params.locale === 'fr'
      ? `Affiché en ${content.descriptionLocale === 'fr' ? 'français' : content.descriptionLocale === 'en' ? 'anglais' : 'langue disponible'}`
      : `Shown in ${content.descriptionLocale === 'fr' ? 'French' : content.descriptionLocale === 'en' ? 'English' : 'the available language'}`;

  return (
    <main className="min-h-screen bg-page px-6 py-10 text-body">
      <section className="mx-auto grid max-w-5xl gap-6 rounded-md border border-border bg-card p-8 shadow-card">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-muted">{t('badge')}</p>
            {association.verification_status === 'verified' ? (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-positive-bg px-3 py-1 text-xs font-semibold text-positive">
                <ShieldCheck aria-hidden="true" size={14} />
                {t('verifiedBadge')}
              </span>
            ) : null}
            <h1 className="text-3xl font-semibold leading-tight text-heading">{content.displayName}</h1>
          </div>
          <Link
            className="inline-flex w-fit items-center gap-2 rounded-sm border border-border bg-raised px-4 py-2 text-sm font-medium text-body shadow-card transition hover:border-border-strong"
            href="/"
          >
            <Building2 aria-hidden="true" size={16} />
            {t('directoryAction')}
          </Link>
        </div>

        <div className="space-y-2">
          <p className="max-w-3xl text-base leading-7 text-secondary">{content.description ?? t('descriptionFallback')}</p>
          {content.description !== null && content.descriptionLocale !== params.locale ? (
            <span className="inline-flex w-fit rounded-full bg-sunken px-3 py-1 text-xs font-semibold text-muted">{fallbackLabel}</span>
          ) : null}
        </div>

        <dl className="grid gap-4 rounded-md border border-border bg-sunken p-5 md:grid-cols-3">
          <div className="space-y-2">
            <dt className="text-sm font-medium text-secondary">{t('locationLabel')}</dt>
            <dd className="inline-flex items-center gap-2 text-heading">
              <MapPin aria-hidden="true" size={16} />
              {association.public_street_address ?? `${association.city}, ${association.province}`}
            </dd>
          </div>
          <div className="space-y-2">
            <dt className="text-sm font-medium text-secondary">{t('languageLabel')}</dt>
            <dd className="inline-flex items-center gap-2 text-heading">
              <Languages aria-hidden="true" size={16} />
              {t(`languages.${association.primary_language}`)}
            </dd>
          </div>
          <div className="space-y-2">
            <dt className="text-sm font-medium text-secondary">{t('contactLabel')}</dt>
            <dd className="text-heading">{association.public_contact_email ?? t('contactDescription')}</dd>
          </div>
        </dl>

        {association.claim_status === 'unclaimed' ? (
          <Link className="inline-flex w-fit items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold text-heading shadow-card" href={{ pathname: '/register', query: { claim: association.id } }}>
            <ShieldCheck aria-hidden="true" size={16} />
            {t('claimAction')}
          </Link>
        ) : null}

        <RequestToConnectAssociationForm associationId={association.id} locale={params.locale} />
      </section>
    </main>
  );
}
