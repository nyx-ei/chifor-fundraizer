import { getTranslations } from 'next-intl/server';
import { Bell, Building2, Flag, MapPin, Search, ShieldCheck } from 'lucide-react';

import { PublicDirectoryHeader } from '@/components/kamga/MockupShell';
import { AssociationRecruitLeadForm } from '@/features/associations/components/AssociationRecruitLeadForm';
import { PublicDirectoryMap } from '@/features/associations/components/PublicDirectoryMap';
import { PublicUseLocationButton } from '@/features/associations/components/PublicUseLocationButton';
import { type PublicAssociationSearchResult, searchPublicAssociations } from '@/features/associations/public-search';
import { Link } from '@/i18n/navigation';

export const dynamic = 'force-dynamic';

const DEFAULT_RADIUS_KM = 10;
const WIDER_RADIUS_KM = 25;
const MAX_RADIUS_KM = 50;
const PAGE_SIZE = 10;

type HomePageProps = {
  params: {
    locale: 'en' | 'fr';
  };
  searchParams: {
    lat?: string;
    lng?: string;
    origin?: string;
    page?: string;
    q?: string;
    radius?: string;
    card?: string;
    language?: string;
    selected?: string;
    view?: string;
    verified?: string;
  };
};

const directoryCopy = {
  en: {
    ambiguousLocation: 'This city name is ambiguous. Name matches are shown, but location results need a more precise city, postal code, or device location.',
    askRegister: 'Ask them to register',
    associationPlural: 'associations',
    associationSingular: 'association',
    compact: 'Compact',
    compareOptions: 'Compare options',
    detailed: 'Detailed',
    distanceAway: (distance: number) => `${distance.toFixed(1)} km away`,
    distanceFilter: (radius: number) => `Within ${radius} km`,
    distanceLabel: 'Distance',
    emptyDescription:
      'The directory is still growing. If you know an RPN association in this area, help us add it - they will be invited to confirm their own listing.',
    filter: 'Filter',
    languageFilter: 'Primary language',
    languageFilters: { all: 'All languages', en: 'English', fr: 'French', fr_en: 'French & English' },
    languages: { en: 'English', fr: 'French', fr_en: 'French & English' },
    localizedFallback: (locale: 'en' | 'fr' | 'fr_en') => `Shown in ${locale === 'fr' ? 'French' : locale === 'en' ? 'English' : 'the available language'}`,
    listFirst: 'List-first + toggle',
    mapOnly: 'Map only',
    areaGroup: '{count} in this area',
    clusterAction: 'Open grouped associations',
    clusterLabel: '{count} associations grouped',
    locationOnlyMap: 'Geocoded visible results are plotted. Public precision is respected.',
    mapLayout: 'Map layout',
    mapPrecision: 'Approximate - respects public precision',
    mapTitle: 'Approximate directory map',
    matching: (query: string) => ` matching "${query}"`,
    nameMatch: 'Name match',
    near: (origin: string) => ` near ${origin}`,
    nearest: 'Nearest listed associations',
    nearestDescription: 'Shown because nothing matched inside the current search radius.',
    next: 'Next',
    noDatabaseResults: 'No active geocoded association record is available from the database for this search.',
    noMockData: 'No fallback association data is fabricated from the mockups.',
    noResults: (query: string) => `No associations found for "${query}" yet`,
    notify: 'Notify me when one is listed',
    pagination: (current: number, total: number) => `Page ${current} of ${total}`,
    previous: 'Previous',
    requestToConnect: 'Request to connect',
    resultCard: 'Result card',
    search: 'Search',
    searchLabel: 'Postal code, address, or city',
    selectedLabel: 'Selected on map',
    searchWider: 'Search wider',
    sideBySide: 'Side-by-side',
    useLocation: 'Use my location',
    useLocationLoading: 'Locating...',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    userLocation: 'your location',
    verified: 'Verified',
    verifiedOnly: 'Verified only',
    claimAction: 'Is this your association? Claim it',
    recruit: {
      associationNameLabel: 'Association name if you know it',
      associationNamePlaceholder: 'Example: RPN association in your area',
      cityLabel: 'City',
      description: 'Send the missing association or area to the Kamga team so it can be invited and verified.',
      emailLabel: 'Email address',
      errors: {
        'KMG-AUTH-401': 'Sign in before submitting this request.',
        'KMG-AUTH-403': 'You are not allowed to submit this request.',
        'KMG-CL-001': 'The claim request is invalid.',
        'KMG-CL-403': 'You are not allowed to claim this listing.',
        'KMG-CL-404': 'This listing could not be found.',
        'KMG-CL-409': 'This listing cannot be claimed right now.',
        'KMG-CL-422': 'The registry number does not match this listing.',
        'KMG-RC-001': 'Add a search term or association name, and use a valid email if provided.',
        'KMG-RC-404': 'This request target is not available.',
        'KMG-RC-429': 'Too many requests were submitted recently. Try again later.',
        'KMG-RG-001': 'Check the submitted values and try again.',
        'KMG-RG-002': 'Upload the requested proof.',
        'KMG-RG-003': 'The uploaded file is too large.',
        'KMG-RG-004': 'Use a supported file type.',
        'KMG-RG-404': 'This association could not be found.',
        'KMG-RG-409': 'This association already exists.',
        'KMG-MG-001': 'The selected records cannot be merged.',
        'KMG-MG-404': 'One of the selected records could not be found.',
        'KMG-MG-409': 'The selected duplicate has already been merged.',
        'KMG-PC-001': 'The privacy request is invalid.',
        'KMG-PC-404': 'The privacy request could not be found.',
        'KMG-PC-409': 'A pending privacy request already exists.',
        'KMG-SYS-000': 'The lead could not be recorded. Try again or contact support.'
      },
      messageLabel: 'Context for the Kamga team',
      messagePlaceholder: 'Share the neighbourhood, contact context, or why this association should be invited.',
      nameLabel: 'Your name',
      privacyNotice: 'This creates an internal Kamga lead for directory growth. Your details are not published.',
      submit: 'Send lead',
      submitting: 'Sending...',
      success: 'Lead recorded. The Kamga team can follow up from the admin workspace.',
      title: 'Help Kamga recruit this association'
    }
  },
  fr: {
    ambiguousLocation: 'Ce nom de ville est ambigu. Les r?sultats par nom sont affich?s, mais les r?sultats de proximit? n?cessitent une ville plus pr?cise, un code postal ou votre position.',
    askRegister: 'L?inviter ? s?inscrire',
    associationPlural: 'associations',
    associationSingular: 'association',
    compact: 'Compact',
    compareOptions: 'Comparer les options',
    detailed: 'D?taill?',
    distanceAway: (distance: number) => `${distance.toFixed(1)} km`,
    distanceFilter: (radius: number) => `Dans un rayon de ${radius} km`,
    distanceLabel: 'Distance',
    emptyDescription:
      'L?annuaire continue de grandir. Si vous connaissez une association RPN dans cette zone, aidez-nous ? l?ajouter ; elle sera invit?e ? confirmer sa propre fiche.',
    filter: 'Filtrer',
    languageFilter: 'Langue principale',
    languageFilters: { all: 'Toutes les langues', en: 'Anglais', fr: 'Fran?ais', fr_en: 'Fran?ais et anglais' },
    languages: { en: 'Anglais', fr: 'Fran?ais', fr_en: 'Fran?ais et anglais' },
    localizedFallback: (locale: 'en' | 'fr' | 'fr_en') => `Affich? en ${locale === 'fr' ? 'fran?ais' : locale === 'en' ? 'anglais' : 'langue disponible'}`,
    listFirst: 'Liste d?abord + bascule',
    mapOnly: 'Carte seulement',
    areaGroup: '{count} dans cette zone',
    clusterAction: 'Ouvrir les associations group?es',
    clusterLabel: '{count} associations group?es',
    locationOnlyMap: 'Les r?sultats g?ocod?s visibles sont affich?s sur la carte. La pr?cision publique est respect?e.',
    mapLayout: 'Disposition de la carte',
    mapPrecision: 'Approximation - respecte la pr?cision publique',
    mapTitle: 'Carte approximative de l?annuaire',
    matching: (query: string) => ` correspondant ? ? ${query} ?`,
    nameMatch: 'Nom correspondant',
    near: (origin: string) => ` pr?s de ${origin}`,
    nearest: 'Associations r?f?renc?es les plus proches',
    nearestDescription: 'Affich?es parce qu?aucun r?sultat ne correspond au rayon actuel.',
    next: 'Suivant',
    noDatabaseResults: 'Aucune fiche association active et g?ocod?e ne correspond ? cette recherche.',
    noMockData: 'Aucune donn?e de secours n?est fabriqu?e depuis les maquettes.',
    noResults: (query: string) => `Aucune association trouv?e pour ? ${query} ?`,
    notify: 'Me notifier lorsqu?une association est ajout?e',
    pagination: (current: number, total: number) => `Page ${current} sur ${total}`,
    previous: 'Pr?c?dent',
    requestToConnect: 'Demander ? ?tre mis en relation',
    resultCard: 'Carte de r?sultat',
    search: 'Rechercher',
    searchLabel: 'Code postal, adresse ou ville',
    selectedLabel: 'S?lectionn?e sur la carte',
    searchWider: '?largir la recherche',
    sideBySide: 'C?te ? c?te',
    useLocation: 'Utiliser ma position',
    useLocationLoading: 'Localisation...',
    zoomIn: 'Zoomer',
    zoomOut: 'D?zoomer',
    userLocation: 'votre position',
    verified: 'V?rifi?e',
    verifiedOnly: 'V?rifi?es uniquement',
    claimAction: 'C?est votre association ? Revendiquez-la',
    recruit: {
      associationNameLabel: 'Nom de l?association si vous le connaissez',
      associationNamePlaceholder: 'Exemple : association RPN de votre secteur',
      cityLabel: 'Ville',
      description: 'Envoyez l?association ou la zone manquante ? l??quipe Kamga afin qu?elle puisse ?tre invit?e et v?rifi?e.',
      emailLabel: 'Adresse courriel',
      errors: {
        'KMG-AUTH-401': 'Connectez-vous avant d?envoyer cette demande.',
        'KMG-AUTH-403': 'Vous n??tes pas autoris? ? envoyer cette demande.',
        'KMG-CL-001': 'La demande de revendication est invalide.',
        'KMG-CL-403': 'Vous n??tes pas autoris? ? revendiquer cette fiche.',
        'KMG-CL-404': 'Cette fiche est introuvable.',
        'KMG-CL-409': 'Cette fiche ne peut pas ?tre revendiqu?e pour le moment.',
        'KMG-CL-422': 'Le num?ro de registre ne correspond pas ? cette fiche.',
        'KMG-RC-001': 'Ajoutez un terme de recherche ou un nom d?association, et utilisez un courriel valide s?il est renseign?.',
        'KMG-RC-404': 'La cible de cette demande n?est pas disponible.',
        'KMG-RC-429': 'Trop de demandes ont ?t? envoy?es r?cemment. R?essayez plus tard.',
        'KMG-RG-001': 'V?rifiez les valeurs envoy?es puis r?essayez.',
        'KMG-RG-002': 'T?l?versez la preuve demand?e.',
        'KMG-RG-003': 'Le fichier t?l?vers? est trop volumineux.',
        'KMG-RG-004': 'Utilisez un type de fichier support?.',
        'KMG-RG-404': 'Cette association est introuvable.',
        'KMG-RG-409': 'Cette association existe d?j?.',
        'KMG-MG-001': 'Les fiches s?lectionn?es ne peuvent pas ?tre fusionn?es.',
        'KMG-MG-404': 'Une des fiches s?lectionn?es est introuvable.',
        'KMG-MG-409': 'Le doublon s?lectionn? a d?j? ?t? fusionn?.',
        'KMG-PC-001': 'La demande de confidentialit? est invalide.',
        'KMG-PC-404': 'La demande de confidentialit? est introuvable.',
        'KMG-PC-409': 'Une demande de confidentialit? est d?j? en attente.',
        'KMG-SYS-000': 'La piste n?a pas pu ?tre enregistr?e. R?essayez ou contactez le support.'
      },
      messageLabel: 'Contexte pour l??quipe Kamga',
      messagePlaceholder: 'Indiquez le quartier, le contexte de contact ou pourquoi cette association devrait ?tre invit?e.',
      nameLabel: 'Votre nom',
      privacyNotice: 'Cela cr?e une piste interne pour d?velopper l?annuaire Kamga. Vos coordonn?es ne sont pas publi?es.',
      submit: 'Envoyer la piste',
      submitting: 'Envoi en cours...',
      success: 'Piste enregistr?e. L??quipe Kamga peut la traiter depuis l?espace admin.',
      title: 'Aidez Kamga ? recruter cette association'
    }
  }
} as const;

function searchQuery(value: string | undefined): string {
  return typeof value === 'string' ? value.trim().slice(0, 80) : '';
}

function numericQuery(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function coordinateQuery(value: string | undefined): number | null {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : null;
}

type DirectoryViewMode = 'list' | 'map' | 'split';
type PrimaryLanguageFilter = 'all' | 'en' | 'fr' | 'fr_en';
type ResultCardMode = 'compact' | 'detailed';

function viewMode(value: string | undefined): DirectoryViewMode {
  return value === 'list' || value === 'map' || value === 'split' ? value : 'split';
}

function primaryLanguageFilter(value: string | undefined): PrimaryLanguageFilter {
  return value === 'en' || value === 'fr' || value === 'fr_en' ? value : 'all';
}

function resultCardMode(value: string | undefined): ResultCardMode {
  return value === 'detailed' ? value : 'compact';
}

function matchesPrimaryLanguage(association: PublicAssociationSearchResult, filter: PrimaryLanguageFilter): boolean {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'fr_en') {
    return association.primaryLanguage === 'fr_en';
  }

  return association.primaryLanguage === filter || association.primaryLanguage === 'fr_en';
}

function pageHref(params: { cardMode: ResultCardMode; languageFilter: PrimaryLanguageFilter; lat: number | null; lng: number | null; origin: string | null; page: number; query: string; radius: number; verifiedOnly: boolean; view?: DirectoryViewMode }) {
  return {
    pathname: '/',
    query: {
      ...(params.query.length > 0 ? { q: params.query } : {}),
      ...(params.lat !== null && params.lng !== null ? { lat: String(params.lat), lng: String(params.lng), origin: params.origin ?? 'device' } : {}),
      ...(params.verifiedOnly ? { verified: '1' } : {}),
      ...(params.languageFilter !== 'all' ? { language: params.languageFilter } : {}),
      ...(params.cardMode === 'detailed' ? { card: params.cardMode } : {}),
      page: String(params.page),
      radius: String(params.radius),
      ...(params.view !== undefined && params.view !== 'split' ? { view: params.view } : {})
    }
  };
}

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const t = await getTranslations('home');
  const copy = directoryCopy[params.locale];
  const query = searchQuery(searchParams.q);
  const radius = Math.min(numericQuery(searchParams.radius, DEFAULT_RADIUS_KM), MAX_RADIUS_KM);
  const currentPage = numericQuery(searchParams.page, 1);
  const selectedAssociationId = searchParams.selected ?? null;
  const verifiedOnly = searchParams.verified === '1';
  const languageFilter = primaryLanguageFilter(searchParams.language);
  const cardMode = resultCardMode(searchParams.card);
  const view = viewMode(searchParams.view);
  const userLatitude = coordinateQuery(searchParams.lat);
  const userLongitude = coordinateQuery(searchParams.lng);
  const originLabel = userLatitude !== null && userLongitude !== null && searchParams.origin === 'device' ? copy.userLocation : null;
  const search = await searchPublicAssociations({ originLabel, query, radiusKm: radius, uiLocale: params.locale, userLatitude, userLongitude, verifiedOnly });
  const ranked = search.results.filter((association) => matchesPrimaryLanguage(association, languageFilter));
  const locationBand = ranked.filter((association) => association.matchReason === 'location');
  const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginatedAssociations = ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasDirectoryResults = ranked.length > 0;
  const canSearchWider = search.locationResolved && locationBand.length < 3 && radius < MAX_RADIUS_KM;
  const mapUrlParams = {
    ...(query.length > 0 ? { q: query } : {}),
    ...(userLatitude !== null && userLongitude !== null ? { lat: String(userLatitude), lng: String(userLongitude), origin: searchParams.origin ?? 'device' } : {}),
    ...(verifiedOnly ? { verified: '1' } : {}),
    ...(languageFilter !== 'all' ? { language: languageFilter } : {}),
    ...(cardMode === 'detailed' ? { card: cardMode } : {}),
    ...(view !== 'split' ? { view } : {}),
    radius: String(radius)
  };
  const viewBaseParams = {
    lat: userLatitude,
    lng: userLongitude,
    origin: searchParams.origin ?? null,
    page: 1,
    query,
    radius,
    verifiedOnly,
    languageFilter,
    cardMode
  };

  return (
    <main className="min-h-screen bg-page text-body">
      <PublicDirectoryHeader locale={params.locale} />

      <section className="px-8 py-10">
        <form className="grid gap-5" method="get">
          {view !== 'split' ? <input name="view" type="hidden" value={view} /> : null}
          {cardMode === 'detailed' ? <input name="card" type="hidden" value={cardMode} /> : null}
          {query.length === 0 && userLatitude !== null && userLongitude !== null ? (
            <>
              <input name="lat" type="hidden" value={userLatitude} />
              <input name="lng" type="hidden" value={userLongitude} />
              <input name="origin" type="hidden" value={searchParams.origin ?? 'device'} />
            </>
          ) : null}
          <label className="grid gap-2 text-sm font-semibold text-heading">
            {copy.searchLabel}
            <span className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
              <span className="relative block">
                <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={20} />
                <input
                  className="h-12 w-full rounded-sm border border-input bg-card pl-12 pr-4 text-base text-body shadow-card transition placeholder:text-secondary focus:border-focus focus:outline-none"
                  defaultValue={query}
                  maxLength={80}
                  name="q"
                  placeholder={t('searchPlaceholder')}
                  type="search"
                />
              </span>
              <PublicUseLocationButton label={copy.useLocation} loadingLabel={copy.useLocationLoading} locale={params.locale} />
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-brand px-7 text-sm font-semibold text-heading shadow-card transition hover:bg-brand-strong" type="submit">
                <Search aria-hidden="true" size={18} />
                {copy.search}
              </button>
            </span>
          </label>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-heading">{copy.filter}</span>
              <label className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 text-sm text-heading shadow-card">
                <span className="font-medium text-secondary">{copy.distanceLabel}</span>
                <select className="bg-transparent font-semibold text-heading outline-none" defaultValue={radius} name="radius">
                  {[5, 10, 25, 50].map((option) => (
                    <option key={option} value={option}>
                      {copy.distanceFilter(option)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 text-sm text-heading shadow-card">
                <span className="font-medium text-secondary">{copy.languageFilter}</span>
                <select className="bg-transparent font-semibold text-heading outline-none" defaultValue={languageFilter} name="language">
                  <option value="all">{copy.languageFilters.all}</option>
                  <option value="fr">{copy.languageFilters.fr}</option>
                  <option value="en">{copy.languageFilters.en}</option>
                  <option value="fr_en">{copy.languageFilters.fr_en}</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-heading">
                <input defaultChecked={verifiedOnly} name="verified" type="checkbox" value="1" />
                {copy.verifiedOnly}
              </label>
              {canSearchWider ? (
                <Link
                  className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold text-brand shadow-card"
                  href={pageHref({ ...viewBaseParams, radius: Math.min(radius === DEFAULT_RADIUS_KM ? WIDER_RADIUS_KM : MAX_RADIUS_KM, MAX_RADIUS_KM), view })}
                >
                  {copy.searchWider}
                </Link>
              ) : null}
            </div>
            <p className="text-sm text-secondary">
              <strong className="text-heading">{ranked.length}</strong> {ranked.length === 1 ? copy.associationSingular : copy.associationPlural}
              {search.originLabel !== null ? copy.near(search.originLabel) : query.length > 0 ? copy.matching(query) : ''}
            </p>
          </div>
        </form>

        {search.ambiguousLocation ? (
          <div className="mt-5 rounded-md border border-warning bg-warning-bg px-5 py-4 text-sm leading-6 text-warning">{copy.ambiguousLocation}</div>
        ) : null}

        {hasDirectoryResults ? (
          <section className="mt-8 grid gap-8">
            <div className="flex flex-wrap items-center gap-6 rounded-md border border-dashed border-brand bg-[#f7f9ff] px-5 py-4">
              <span className="text-xs font-semibold uppercase text-[#3454b8]">{copy.compareOptions}</span>
              <span className="text-sm font-semibold text-secondary">{copy.mapLayout}</span>
              <Link className={`rounded-sm px-4 py-2 text-sm font-semibold shadow-card ${view === 'split' ? 'bg-sunken text-heading' : 'bg-[#eef1f7] text-secondary hover:text-heading'}`} href={pageHref({ ...viewBaseParams, view: 'split' })}>
                {copy.sideBySide}
              </Link>
              <Link className={`rounded-sm px-4 py-2 text-sm font-semibold shadow-card ${view === 'list' ? 'bg-sunken text-heading' : 'bg-[#eef1f7] text-secondary hover:text-heading'}`} href={pageHref({ ...viewBaseParams, view: 'list' })}>
                {copy.listFirst}
              </Link>
              <Link className={`rounded-sm px-4 py-2 text-sm font-semibold shadow-card ${view === 'map' ? 'bg-sunken text-heading' : 'bg-[#eef1f7] text-secondary hover:text-heading'}`} href={pageHref({ ...viewBaseParams, view: 'map' })}>
                {copy.mapOnly}
              </Link>
              <span className="text-sm font-semibold text-secondary">{copy.resultCard}</span>
              <Link className={`rounded-sm px-4 py-2 text-sm font-semibold shadow-card ${cardMode === 'compact' ? 'bg-sunken text-heading' : 'bg-[#eef1f7] text-secondary hover:text-heading'}`} href={pageHref({ ...viewBaseParams, cardMode: 'compact', page, view })}>
                {copy.compact}
              </Link>
              <Link className={`rounded-sm px-4 py-2 text-sm font-semibold shadow-card ${cardMode === 'detailed' ? 'bg-sunken text-heading' : 'bg-[#eef1f7] text-secondary hover:text-heading'}`} href={pageHref({ ...viewBaseParams, cardMode: 'detailed', page, view })}>
                {copy.detailed}
              </Link>
            </div>

            <div className={`grid gap-8 ${view === 'split' ? 'lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]' : ''}`}>
              {view !== 'map' ? (
                <div className="grid content-start gap-4">
                  {paginatedAssociations.map((association) => (
                    <article className={`grid scroll-mt-8 rounded-md border bg-card p-5 shadow-card ${association.id === selectedAssociationId ? 'border-brand ring-2 ring-brand/30' : 'border-border'}`} id={`association-${association.id}`} key={association.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-5">
                          <span className="grid size-10 rotate-45 place-items-center rounded-[8px] border-2 border-[#314ca8] bg-[#4d67c7] text-sm font-semibold text-white shadow-card">
                            <span className="-rotate-45">{association.rank}</span>
                          </span>
                          <div className="space-y-3">
                            <div>
                              <h2 className="text-xl font-semibold text-heading">{association.displayName}</h2>
                              <p className="mt-1 inline-flex items-center gap-2 text-sm text-secondary">
                                <MapPin aria-hidden="true" size={16} />
                                {association.city}, {association.province}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {association.matchReason === 'identity' && query.length > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#eef1f7] px-3 py-1 text-xs font-semibold text-secondary">{copy.nameMatch}</span>
                              ) : association.matchReason === 'location' && association.distanceKm !== null ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#eef1f7] px-3 py-1 text-xs font-semibold text-secondary">{copy.distanceAway(association.distanceKm)}</span>
                              ) : null}
                              {association.verificationStatus === 'verified' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-positive-bg px-3 py-1 text-xs font-semibold text-positive">
                                  <ShieldCheck aria-hidden="true" size={13} />
                                  {copy.verified}
                                </span>
                              ) : null}
                              <span className="inline-flex items-center gap-1 rounded-full bg-info-bg px-3 py-1 text-xs font-semibold text-info">
                                <Flag aria-hidden="true" size={13} />
                                {copy.languages[association.primaryLanguage]}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className={`${cardMode === 'compact' ? 'line-clamp-2' : ''} max-w-2xl text-sm leading-6 text-secondary`}>{association.description ?? t('descriptionFallback')}</p>
                              {association.description !== null && association.contentLocale !== params.locale ? (
                                <span className="inline-flex w-fit rounded-full bg-sunken px-3 py-1 text-xs font-semibold text-muted">{copy.localizedFallback(association.contentLocale)}</span>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <Link
                                className="inline-flex w-fit items-center gap-2 rounded-sm bg-brand px-4 py-2 text-sm font-semibold text-heading shadow-card transition hover:bg-brand-strong"
                                href={`/associations/${association.id}`}
                              >
                                <Building2 aria-hidden="true" size={16} />
                                {copy.requestToConnect}
                              </Link>
                              {association.claimStatus === 'unclaimed' ? (
                                <Link className="inline-flex w-fit items-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold text-brand" href={{ pathname: '/register', query: { claim: association.id } }}>
                                  <ShieldCheck aria-hidden="true" size={16} />
                                  {copy.claimAction}
                                </Link>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}

                  {totalPages > 1 ? (
                    <nav className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm shadow-card" aria-label="Pagination">
                      <p className="font-medium text-secondary">{copy.pagination(page, totalPages)}</p>
                      <div className="flex gap-2">
                        <Link className={`rounded-sm border border-border px-4 py-2 font-semibold shadow-card ${page === 1 ? 'pointer-events-none text-muted' : 'text-heading'}`} href={pageHref({ ...viewBaseParams, page: Math.max(1, page - 1), view })}>
                          {copy.previous}
                        </Link>
                        <Link className={`rounded-sm border border-border px-4 py-2 font-semibold shadow-card ${page === totalPages ? 'pointer-events-none text-muted' : 'text-heading'}`} href={pageHref({ ...viewBaseParams, page: Math.min(totalPages, page + 1), view })}>
                          {copy.next}
                        </Link>
                      </div>
                    </nav>
                  ) : null}
                </div>
              ) : null}

              {view !== 'list' ? (
                <PublicDirectoryMap
                  associations={ranked}
                  copy={{
                    areaGroup: copy.areaGroup,
                    clusterAction: copy.clusterAction,
                    clusterLabel: copy.clusterLabel,
                    locationOnlyMap: copy.locationOnlyMap,
                    mapPrecision: copy.mapPrecision,
                    mapTitle: copy.mapTitle,
                    selectedLabel: copy.selectedLabel,
                    zoomIn: copy.zoomIn,
                    zoomOut: copy.zoomOut
                  }}
                  locale={params.locale}
                  pageSize={PAGE_SIZE}
                  selectedAssociationId={selectedAssociationId}
                  urlParams={mapUrlParams}
                />
              ) : null}
            </div>
          </section>
        ) : (
          <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-md border border-border bg-card p-12 shadow-card">
              <span className="grid size-16 place-items-center rounded-md bg-[#f1f4ff] text-[#3454b8]">
                <Search aria-hidden="true" size={34} />
              </span>
              <h2 className="mt-8 text-3xl font-semibold text-heading">{query.length > 0 ? copy.noResults(query) : t('emptyState')}</h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-secondary">{copy.emptyDescription}</p>
              <AssociationRecruitLeadForm city={search.originLabel} copy={copy.recruit} locale={params.locale} searchQuery={query} />
              <div className="mt-7 flex flex-wrap gap-4">
                <Link className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-5 py-3 text-sm font-semibold text-heading shadow-card transition hover:border-border-strong" href="/register">
                  <Building2 aria-hidden="true" size={16} />
                  {copy.askRegister}
                </Link>
                <button className="inline-flex cursor-not-allowed items-center gap-2 rounded-sm px-5 py-3 text-sm font-semibold text-muted" disabled type="button">
                  <Bell aria-hidden="true" size={16} />
                  {copy.notify}
                </button>
              </div>
            </article>

            <aside className="rounded-md border border-border bg-card p-9 shadow-card">
              <h2 className="text-xs font-semibold uppercase text-muted">{copy.nearest}</h2>
              {search.nearest.length === 0 ? (
                <div className="mt-5 rounded-sm border border-border bg-sunken px-5 py-6">
                  <p className="text-sm leading-6 text-secondary">{copy.noDatabaseResults}</p>
                </div>
              ) : (
                <div className="mt-5 grid gap-3">
                  {search.nearest.map((association) => (
                    <Link className="rounded-sm border border-border bg-sunken px-4 py-3 text-sm font-semibold text-heading" href={`/associations/${association.id}`} key={association.id}>
                      {association.displayName}
                      <span className="block font-normal text-secondary">{association.distanceKm === null ? association.city : copy.distanceAway(association.distanceKm)}</span>
                    </Link>
                  ))}
                  <p className="text-sm leading-6 text-secondary">{copy.nearestDescription}</p>
                </div>
              )}
              <p className="mt-6 text-sm leading-6 text-secondary">{copy.noMockData}</p>
            </aside>
          </section>
        )}

        <p className="sr-only" id="directory-about">
          {t('description')}
        </p>
      </section>
    </main>
  );
}
