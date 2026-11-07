export async function getActiveSponsorForProperty(propertyId: string, targetZip: string) {
  const parsedId = PropertyIdSchema.safeParse(propertyId);
  const parsedZip = ZipSchema.safeParse(targetZip);

  if (!parsedId.success || !parsedZip.success) {
    return null;
  }

  const supabase = createPublicClient();

  const { data: link, error: linkError } = await supabase
    .from('property_sponsors')
    .select(`
      property_id,
      sponsors!inner (
        id,
        company_name,
        destination_url,
        is_active,
        approved
      )
    `)
    .eq('property_id', parsedId.data) // Matches your property reference column
    .eq('sponsors.is_active', true)
    .eq('sponsors.approved', true)
    .limit(1)
    .maybeSingle();

  if (linkError || !link?.sponsors) {
    return null;
  }

  return link.sponsors;
}
