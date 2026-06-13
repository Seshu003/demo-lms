// lib/frappe.js
const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.FRAPPE_URL;

export async function frappeGet(method, params = {}) {
  const url = new URL(`${FRAPPE_URL}/api/method/${method}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    credentials: "include",   // sends Frappe session cookie
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return data.message;
}

export async function frappePost(method, body = {}) {
  const res = await fetch(`${FRAPPE_URL}/api/method/${method}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.message;
}

// Fetch enrolled courses from Frappe LMS
export async function getEnrolledCourses() {
  return frappeGet("academy_portal.api.get_enrolled_courses");
}