import { z } from "zod";
import { callPipiAdsApi } from "../client.js";
import { nonEmptyString } from "../validation.js";

const notificationSwitch = z.union([z.literal(1), z.literal(2)]);

export const createMonitorGroupSchema = z.object({
  name: nonEmptyString.describe("Group name"),
});

export async function createMonitorGroup(params: z.infer<typeof createMonitorGroupSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-groups/create", params);
  return JSON.stringify(result.data, null, 2);
}

export const listMonitorGroupsSchema = z.object({});

export async function listMonitorGroups(params: z.infer<typeof listMonitorGroupsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-groups/list", params);
  return JSON.stringify(result.data, null, 2);
}

export const updateMonitorGroupSchema = z.object({
  group_id: nonEmptyString.describe("Group ID to update"),
  name: nonEmptyString.describe("New group name"),
});

export async function updateMonitorGroup(params: z.infer<typeof updateMonitorGroupSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-groups/update", params);
  return JSON.stringify(result.data, null, 2);
}

export const deleteMonitorGroupSchema = z.object({
  group_id: nonEmptyString.describe("Group ID to delete"),
});

export async function deleteMonitorGroup(params: z.infer<typeof deleteMonitorGroupSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-groups/delete", params);
  return JSON.stringify(result.data, null, 2);
}

export const getMonitorNotificationsSchema = z.object({});

export async function getMonitorNotifications(params: z.infer<typeof getMonitorNotificationsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-notifications/get", params);
  return JSON.stringify(result.data, null, 2);
}

export const saveMonitorNotificationsSchema = z.object({
  notification_email: z.string().email().describe("Notification email address"),
  notification_status: notificationSwitch.describe("Notification status: 1=Enabled, 2=Disabled"),
  instant_ad_notification: notificationSwitch.describe("Instant ad notification: 1=Enabled, 2=Disabled"),
  instant_product_notification: notificationSwitch.describe("Instant product notification: 1=Enabled, 2=Disabled"),
  daily_report: notificationSwitch.describe("Daily report: 1=Enabled, 2=Disabled"),
  weekly_report: notificationSwitch.describe("Weekly report: 1=Enabled, 2=Disabled"),
});

export async function saveMonitorNotifications(params: z.infer<typeof saveMonitorNotificationsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-notifications/save", params);
  return JSON.stringify(result.data, null, 2);
}
