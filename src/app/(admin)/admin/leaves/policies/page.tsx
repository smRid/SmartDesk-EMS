import { createHolidayAction, updateLeavePolicyAction } from "@/lib/actions";
import { getLeavePolicyAdminData } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { leaveTypeLabels } from "@/lib/constants";

export default async function LeavePoliciesPage() {
  const { policies, holidays } = await getLeavePolicyAdminData();
  async function savePolicy(formData: FormData) { "use server"; await updateLeavePolicyAction(formData); }
  async function saveHoliday(formData: FormData) { "use server"; await createHolidayAction(formData); }
  return <div className="space-y-6">
    <PageHeader description="Configure entitlements and working-day rules. Values require HR review and are not statutory defaults." title="Leave Policies & Calendar" />
    <div className="grid gap-5 xl:grid-cols-2">{policies.map((policy) =>
      <Card key={policy.id}><CardHeader><CardTitle>{leaveTypeLabels[policy.leaveType]}</CardTitle></CardHeader><CardContent>
        <form action={savePolicy} className="grid gap-4 sm:grid-cols-2">
          <input name="leaveType" type="hidden" value={policy.leaveType} />
          <div className="space-y-2"><Label>Annual entitlement</Label><Input defaultValue={policy.annualEntitlement} min="0" name="annualEntitlement" step="0.5" type="number" /></div>
          <div className="space-y-2"><Label>Entitlement cycle</Label><Select defaultValue={policy.cycleType} name="cycleType"><option value="calendar_year">Calendar year</option><option value="anniversary_year">Work anniversary</option></Select></div>
          {[["isActive", "Policy active", policy.isActive], ["excludeWeekends", "Exclude weekends", policy.excludeWeekends], ["excludeHolidays", "Exclude holidays", policy.excludeHolidays], ["allowHalfDay", "Allow half-days", policy.allowHalfDay], ["reservePending", "Reserve pending requests", policy.reservePending], ["allowNegativeWithApproval", "Allow exception approval", policy.allowNegativeWithApproval]].map(([name, text, checked]) => <label className="flex items-center gap-2 text-sm" key={String(name)}><input defaultChecked={Boolean(checked)} name={String(name)} type="checkbox" />{String(text)}</label>)}
          <div className="sm:col-span-2"><Button type="submit">Save policy</Button></div>
        </form>
      </CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle>Holiday calendar</CardTitle></CardHeader><CardContent className="space-y-5">
      <form action={saveHoliday} className="flex flex-col gap-3 sm:flex-row"><Input aria-label="Holiday name" name="name" placeholder="Holiday name" required /><Input aria-label="Holiday date" name="holidayDate" required type="date" /><Button type="submit">Add holiday</Button></form>
      <ul className="grid gap-2 sm:grid-cols-2">{holidays.map((holiday) => <li className="rounded-xl border p-3" key={holiday.id}><span className="font-semibold">{holiday.name}</span><span className="ml-2 text-sm text-muted">{holiday.holidayDate}</span></li>)}</ul>
    </CardContent></Card>
  </div>;
}
