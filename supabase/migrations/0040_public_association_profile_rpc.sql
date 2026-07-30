-- Public association profile RPC: aligns profile lookup with the public search contract.

create or replace function public.get_public_association_profile(association_uuid uuid)
returns table (
  id uuid,
  display_name text,
  display_name_en text,
  display_name_fr text,
  city text,
  province text,
  description text,
  description_en text,
  description_fr text,
  primary_language text,
  verification_status text,
  claim_status text,
  public_contact_email text,
  public_street_address text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id,
    coalesce(nullif(a.common_name, ''), a.official_name, a.name) as display_name,
    coalesce(nullif(a.common_name_en, ''), nullif(a.common_name, ''), a.official_name, a.name) as display_name_en,
    coalesce(nullif(a.common_name_fr, ''), nullif(a.common_name, ''), a.official_name, a.name) as display_name_fr,
    coalesce(a.city, '') as city,
    coalesce(a.province, '') as province,
    a.description,
    coalesce(nullif(a.description_en, ''), a.description) as description_en,
    coalesce(nullif(a.description_fr, ''), a.description) as description_fr,
    a.primary_language::text as primary_language,
    a.verification_status::text as verification_status,
    a.claim_status::text as claim_status,
    case when a.public_contact_email then a.contact_email else null end as public_contact_email,
    case when a.public_precision = 'exact' then a.street_address else null end as public_street_address
  from public.associations a
  where a.id = association_uuid
    and a.status = 'active'
  limit 1;
$$;

grant execute on function public.get_public_association_profile(uuid) to anon, authenticated;
