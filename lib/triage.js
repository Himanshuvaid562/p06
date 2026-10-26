// MODULE 3 - Triage: decide category, priority and which faculty gets the query

// course -> faculty (change these to real names)
export const courseFaculty = {
  CSE310: "Dr. Sharma",
  CSE326: "Prof. Singh",
  MTH174: "Dr. Kaur",
};

export function triage(course, question) {
  const text = question.toLowerCase();

  let category = "Concept Doubt";
  if (/exam|marks|result|grade|paper/.test(text)) category = "Exam / Marks";
  else if (/assignment|submission|deadline|project/.test(text)) category = "Assignment";
  else if (/attendance|leave|absent|medical/.test(text)) category = "Attendance";
  else if (/meet|appointment|office hour|discuss/.test(text)) category = "Meeting Request";

  const priority = /urgent|today|tomorrow|asap|deadline/.test(text) ? "High" : "Normal";
  const assignedTo = courseFaculty[course] || "Unassigned";

  return { category, priority, assignedTo };
}
