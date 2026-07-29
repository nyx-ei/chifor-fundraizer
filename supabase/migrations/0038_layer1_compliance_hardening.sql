-- Layer 1 compliance hardening: explicit audit metadata for privacy-sensitive association changes.
create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_uuid uuid;
  changed text[];
  current_row jsonb;
  previous_row jsonb;
  row_uuid uuid;
begin
  actor_uuid := auth.uid();
  current_row := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  previous_row := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  row_uuid := nullif(coalesce(current_row ->> 'id', previous_row ->> 'id'), '')::uuid;

  if tg_op = 'UPDATE' then
    changed := public.audit_changed_columns(previous_row, current_row);

    if array_length(changed, 1) is null then
      return new;
    end if;
  else
    changed := '{}';
  end if;

  insert into public.audit_logs (
    actor_user_id,
    table_name,
    record_id,
    action,
    changed_columns,
    metadata
  )
  values (
    actor_uuid,
    tg_table_name,
    row_uuid,
    tg_op,
    changed,
    jsonb_strip_nulls(jsonb_build_object(
      'schema', tg_table_schema,
      'status_before', previous_row ->> 'status',
      'status_after', current_row ->> 'status',
      'role_before', previous_row ->> 'role',
      'role_after', current_row ->> 'role',
      'verification_status_before', previous_row ->> 'verification_status',
      'verification_status_after', current_row ->> 'verification_status',
      'geocode_status_before', previous_row ->> 'geocode_status',
      'geocode_status_after', current_row ->> 'geocode_status',
      'public_precision_before', previous_row ->> 'public_precision',
      'public_precision_after', current_row ->> 'public_precision',
      'public_contact_email_before', previous_row ->> 'public_contact_email',
      'public_contact_email_after', current_row ->> 'public_contact_email',
      'admin_public_precision_exact_override',
        case
          when tg_table_name = 'associations'
            and tg_op = 'UPDATE'
            and (previous_row ->> 'public_precision') is distinct from (current_row ->> 'public_precision')
            and (current_row ->> 'public_precision') = 'exact'
          then true
          else null
        end
    ))
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
