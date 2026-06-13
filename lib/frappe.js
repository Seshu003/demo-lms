// lib/frappe.js

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.FRAPPE_URL;

// Default demo courses fallback
const DEFAULT_COURSES = [
  { id: '1', title: 'Python Fundamentals', instructor: 'Administrator', category: 'Professionals', enrolled: 37, status: 'Published', date: 'Jan 11, 2023' },
  { id: '2', title: 'Data Structures & Algorithms', instructor: 'John Samoh', category: 'Collaborate', enrolled: 25, status: 'Published', date: 'Jan 11, 2023' },
  { id: '3', title: 'Advanced Machine Learning', instructor: 'John Smiths', category: 'Collaborate', enrolled: 12, status: 'Published', date: 'Jan 11, 2023' },
  { id: '4', title: 'Web Development with Next.js', instructor: 'John Sarith', category: 'Collaborate', enrolled: 18, status: 'Draft', date: 'Jan 11, 2023' },
];

export async function frappeGet(method, params = {}) {
  if (!FRAPPE_URL) throw new Error("Frappe URL not configured");
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
  if (!FRAPPE_URL) throw new Error("Frappe URL not configured");
  const res = await fetch(`${FRAPPE_URL}/api/method/${method}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.message;
}

export async function frappeRestGet(resource, params = {}) {
  if (!FRAPPE_URL) throw new Error("Frappe URL not configured");
  const url = new URL(`${FRAPPE_URL}/api/resource/${resource}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return data.data;
}

export async function frappeRestPost(resource, body = {}) {
  if (!FRAPPE_URL) throw new Error("Frappe URL not configured");
  const res = await fetch(`${FRAPPE_URL}/api/resource/${resource}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.data;
}

export async function frappeRestPut(resource, name, body = {}) {
  if (!FRAPPE_URL) throw new Error("Frappe URL not configured");
  const res = await fetch(`${FRAPPE_URL}/api/resource/${resource}/${name}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.data;
}

export async function frappeRestDelete(resource, name) {
  if (!FRAPPE_URL) throw new Error("Frappe URL not configured");
  const res = await fetch(`${FRAPPE_URL}/api/resource/${resource}/${name}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return data;
}

// Fetch enrolled courses from Frappe LMS
export async function getEnrolledCourses() {
  if (FRAPPE_URL) {
    return frappeGet("academy_portal.api.get_enrolled_courses");
  }
  // Simulated Fallback
  return DEFAULT_COURSES.filter(c => c.status === 'Published');
}

// --- High-level Unified REST-based Course Management API ---

/**
 * Fetch all courses (filtered or unfiltered)
 */
export async function getCourses() {
  if (FRAPPE_URL) {
    try {
      // Fetch LMS Courses from Frappe DocType
      const courses = await frappeRestGet("LMS Course", {
        fields: JSON.stringify(["name", "title", "instructor", "category", "status", "creation"]),
        limit_page_length: 100
      });
      return courses.map(c => ({
        id: c.name,
        title: c.title,
        instructor: c.instructor || "Administrator",
        category: c.category || "Professionals",
        enrolled: Math.floor(Math.random() * 40) + 5, // Simulated enrollment count
        status: c.status || "Published",
        date: new Date(c.creation).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }));
    } catch (e) {
      console.error("Failed to fetch courses from Frappe REST API. Falling back to local state.", e);
    }
  }

  // Fallback to LocalStorage for offline/simulated mode
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin_courses_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    localStorage.setItem('admin_courses_list', JSON.stringify(DEFAULT_COURSES));
    return DEFAULT_COURSES;
  }
  return DEFAULT_COURSES;
}

/**
 * Create a new course
 */
export async function createCourse(courseData) {
  if (FRAPPE_URL) {
    try {
      const result = await frappeRestPost("LMS Course", {
        title: courseData.title,
        instructor: courseData.instructor || "Administrator",
        category: courseData.category || "Professionals",
        status: courseData.status || "Draft"
      });
      return {
        id: result.name,
        title: result.title,
        instructor: result.instructor || "Administrator",
        category: result.category || "Professionals",
        enrolled: 0,
        status: result.status || "Draft",
        date: new Date(result.creation).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    } catch (e) {
      console.error("Failed to create course via Frappe REST API. Falling back to local state.", e);
    }
  }

  // Simulated Fallback
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin_courses_list') || JSON.stringify(DEFAULT_COURSES);
    const courses = JSON.parse(saved);
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newCourse = {
      ...courseData,
      id: Date.now().toString(),
      enrolled: 0,
      date: formattedDate
    };
    courses.unshift(newCourse);
    localStorage.setItem('admin_courses_list', JSON.stringify(courses));
    return newCourse;
  }
  return courseData;
}

/**
 * Update a course
 */
export async function updateCourse(id, courseData) {
  if (FRAPPE_URL) {
    try {
      const result = await frappeRestPut("LMS Course", id, {
        title: courseData.title,
        instructor: courseData.instructor,
        category: courseData.category,
        status: courseData.status
      });
      return {
        id: result.name,
        title: result.title,
        instructor: result.instructor,
        category: result.category,
        enrolled: courseData.enrolled || 0,
        status: result.status,
        date: courseData.date
      };
    } catch (e) {
      console.error("Failed to update course via Frappe REST API. Falling back to local state.", e);
    }
  }

  // Simulated Fallback
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin_courses_list') || JSON.stringify(DEFAULT_COURSES);
    const courses = JSON.parse(saved);
    const updated = courses.map(c => c.id === id ? { ...c, ...courseData } : c);
    localStorage.setItem('admin_courses_list', JSON.stringify(updated));
    return courseData;
  }
  return courseData;
}

/**
 * Delete a course
 */
export async function deleteCourse(id) {
  if (FRAPPE_URL) {
    try {
      await frappeRestDelete("LMS Course", id);
      return true;
    } catch (e) {
      console.error("Failed to delete course via Frappe REST API. Falling back to local state.", e);
    }
  }

  // Simulated Fallback
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin_courses_list') || JSON.stringify(DEFAULT_COURSES);
    const courses = JSON.parse(saved);
    const filtered = courses.filter(c => c.id !== id);
    localStorage.setItem('admin_courses_list', JSON.stringify(filtered));
    return true;
  }
  return false;
}