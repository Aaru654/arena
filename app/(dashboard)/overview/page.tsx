import { requireTenantAdmin } from '@/app/lib/auth/session';
import { createClient } from '@/app/lib/supabase/server';
import { Building2, Users, Eye, Clock } from 'lucide-react';
import { StatCard } from '@/src/components/dashboard/StatCard';
import { PropertyCard } from '@/src/components/dashboard/PropertyCard';
import { PlanInfoCard } from '@/src/components/dashboard/PlanInfoCard';
import { ActivityFeed } from '@/src/components/dashboard/ActivityFeed';
import { RealtimePropertyUpdater } from '@/src/components/dashboard/RealtimePropertyUpdater';

export default async function OverviewPage() {
  const { tenant, profile } = await requireTenantAdmin();
  const supabase = await createClient();

  // Fetch stats
  const [propertiesResult, collectionsResult, inquiriesResult] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('tenant_id', profile.tenant_id),
    supabase.from('collections').select('id', { count: 'exact', head: true }).eq('tenant_id', profile.tenant_id),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('tenant_id', profile.tenant_id),
  ]);

  const propertyCount = propertiesResult.count || 0;
  const collectionCount = collectionsResult.count || 0;
  const inquiryCount = inquiriesResult.count || 0;

  // Fetch recent properties with images
  const { data: recentProperties } = await supabase
    .from('properties')
    .select(`
      id, slug, title, property_type, status, price, location, city,
      bedrooms, bathrooms, area_sqft, created_at,
      property_images(id, storage_path, is_cover, display_order)
    `)
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })
    .limit(4);

  // Fetch recent activity
  const { data: activities } = await supabase
    .from('activity_log')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-zilla text-[var(--foreground)]">Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Properties"
          value={propertyCount}
          icon={Building2}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          label="Collections"
          value={collectionCount}
          icon={Eye}
          trend={{ value: 5, positive: true }}
        />
        <StatCard
          label="Inquiries"
          value={inquiryCount}
          icon={Users}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          label="Avg Response Time"
          value="2.5h"
          icon={Clock}
          trend={{ value: 15, positive: false }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Properties Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent Properties</h2>
            <a href="/dashboard/properties" className="text-sm text-[var(--accent)] hover:underline">
              View all
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProperties && recentProperties.length > 0 ? (
              recentProperties.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-[var(--text-muted)] border border-[var(--border)] rounded-lg">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No properties yet</p>
                <a href="/dashboard/properties" className="text-sm text-[var(--accent)] hover:underline mt-2 block">
                  Add your first property
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PlanInfoCard />
          <ActivityFeed activities={activities || []} />
        </div>
      </div>

      {/* Realtime Updates */}
      <RealtimePropertyUpdater />
    </div>
  );
}
