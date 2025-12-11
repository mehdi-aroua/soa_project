package com.university.course;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebService;
import java.util.*;

@WebService
public class CourseService {
    // In-memory stores (replace with DB later)
    private static final Map<Integer, Course> courses = new HashMap<>();
    private static final Map<Integer, Set<Integer>> enrollments = new HashMap<>(); // courseId -> studentIds
    private static final Map<Integer, Schedule> schedules = new HashMap<>(); // scheduleId -> schedule

    public CourseService() {
        // seed sample courses
        courses.put(1, new Course(1, "CS101", "Mathématiques", "Analyse 1", 6, 60, "SCI", "L1", 1001, "A101"));
        courses.put(2, new Course(2, "CS201", "Programmation Java", "POO et Collections", 5, 45, "INFO", "L2", 1002, "B202"));
    }

    // ===== Courses =====
    @WebMethod
    public Course getCourse(@WebParam(name = "id") int id) {
        return courses.get(id);
    }

    @WebMethod
    public List<Course> getAllCourses() {
        return new ArrayList<>(courses.values());
    }

    @WebMethod
    public String addCourse(
            @WebParam(name = "id") int id,
            @WebParam(name = "code") String code,
            @WebParam(name = "name") String name,
            @WebParam(name = "description") String description,
            @WebParam(name = "credits") int credits,
            @WebParam(name = "hours") int hours,
            @WebParam(name = "filiere") String filiere,
            @WebParam(name = "niveau") String niveau,
            @WebParam(name = "enseignantId") Integer enseignantId,
            @WebParam(name = "salle") String salle
    ) {
        if (courses.containsKey(id)) {
            return "Course already exists!";
        }
        Course c = new Course(id, code, name, description, credits, hours, filiere, niveau, enseignantId, salle);
        courses.put(id, c);
        return "Course created successfully!";
    }

    @WebMethod
    public String updateCourse(
            @WebParam(name = "id") int id,
            @WebParam(name = "code") String code,
            @WebParam(name = "name") String name,
            @WebParam(name = "description") String description,
            @WebParam(name = "credits") int credits,
            @WebParam(name = "hours") int hours,
            @WebParam(name = "filiere") String filiere,
            @WebParam(name = "niveau") String niveau,
            @WebParam(name = "enseignantId") Integer enseignantId,
            @WebParam(name = "salle") String salle
    ) {
        Course c = courses.get(id);
        if (c == null) return "Course not found";
        c.setCode(code);
        c.setName(name);
        c.setDescription(description);
        c.setCredits(credits);
        c.setHours(hours);
        c.setFiliere(filiere);
        c.setNiveau(niveau);
        c.setEnseignantId(enseignantId);
        c.setSalle(salle);
        return "Course updated";
    }

    @WebMethod
    public String deleteCourse(@WebParam(name = "id") int id) {
        Course removed = courses.remove(id);
        if (removed == null) return "Course not found";
        enrollments.remove(id);
        // remove schedules belonging to the course
        List<Integer> toRemove = new ArrayList<>();
        for (Map.Entry<Integer, Schedule> e : schedules.entrySet()) {
            if (e.getValue().getCourseId() == id) toRemove.add(e.getKey());
        }
        for (Integer sid : toRemove) schedules.remove(sid);
        return "Course deleted";
    }

    @WebMethod
    public List<Course> listCoursesFiltered(
            @WebParam(name = "filiere") String filiere,
            @WebParam(name = "niveau") String niveau,
            @WebParam(name = "code") String code,
            @WebParam(name = "name") String name
    ) {
        List<Course> out = new ArrayList<>();
        for (Course c : courses.values()) {
            if (filiere != null && !filiere.isEmpty() && (c.getFiliere() == null || !c.getFiliere().equalsIgnoreCase(filiere))) continue;
            if (niveau != null && !niveau.isEmpty() && (c.getNiveau() == null || !c.getNiveau().equalsIgnoreCase(niveau))) continue;
            if (code != null && !code.isEmpty() && (c.getCode() == null || !c.getCode().toLowerCase().contains(code.toLowerCase()))) continue;
            if (name != null && !name.isEmpty() && (c.getName() == null || !c.getName().toLowerCase().contains(name.toLowerCase()))) continue;
            out.add(c);
        }
        return out;
    }

    // ===== Enrollments =====
    @WebMethod
    public String enrollStudent(
            @WebParam(name = "courseId") int courseId,
            @WebParam(name = "studentId") int studentId
    ) {
        if (!courses.containsKey(courseId)) return "Course not found";
        enrollments.putIfAbsent(courseId, new HashSet<Integer>());
        Set<Integer> set = enrollments.get(courseId);
        if (set.contains(studentId)) return "Student already enrolled";
        set.add(studentId);
        return "Enrolled";
    }

    @WebMethod
    public List<Integer> getEnrolledStudents(@WebParam(name = "courseId") int courseId) {
        Set<Integer> set = enrollments.getOrDefault(courseId, new HashSet<Integer>());
        return new ArrayList<>(set);
    }

    @WebMethod
    public String unenrollStudent(
            @WebParam(name = "courseId") int courseId,
            @WebParam(name = "studentId") int studentId
    ) {
        Set<Integer> set = enrollments.get(courseId);
        if (set == null || !set.contains(studentId)) return "Not enrolled";
        set.remove(studentId);
        return "Unenrolled";
    }

    // ===== Schedules =====
    @WebMethod
    public String addSchedule(
            @WebParam(name = "scheduleId") int scheduleId,
            @WebParam(name = "courseId") int courseId,
            @WebParam(name = "dayOfWeek") String dayOfWeek,
            @WebParam(name = "startTime") String startTime,
            @WebParam(name = "endTime") String endTime,
            @WebParam(name = "room") String room
    ) {
        if (!courses.containsKey(courseId)) return "Course not found";
        if (schedules.containsKey(scheduleId)) return "Schedule already exists";
        // conflict: same room, same day, overlapping time
        for (Schedule s : schedules.values()) {
            if (s.getRoom().equalsIgnoreCase(room) && s.getDayOfWeek().equalsIgnoreCase(dayOfWeek)) {
                if (overlaps(s.getStartTime(), s.getEndTime(), startTime, endTime)) {
                    return "Schedule conflict detected";
                }
            }
        }
        schedules.put(scheduleId, new Schedule(scheduleId, courseId, dayOfWeek, startTime, endTime, room));
        return "Schedule added";
    }

    @WebMethod
    public List<Schedule> getSchedules(@WebParam(name = "courseId") int courseId) {
        List<Schedule> out = new ArrayList<>();
        for (Schedule s : schedules.values()) if (s.getCourseId() == courseId) out.add(s);
        return out;
    }

    @WebMethod
    public String deleteSchedule(@WebParam(name = "scheduleId") int scheduleId) {
        Schedule removed = schedules.remove(scheduleId);
        return removed == null ? "Schedule not found" : "Schedule deleted";
    }

    // ===== Helpers =====
    private boolean overlaps(String s1, String e1, String s2, String e2) {
        // expects HH:mm
        int aStart = toMinutes(s1);
        int aEnd = toMinutes(e1);
        int bStart = toMinutes(s2);
        int bEnd = toMinutes(e2);
        return aStart < bEnd && bStart < aEnd;
    }

    private int toMinutes(String hhmm) {
        String[] parts = hhmm.split(":");
        int h = Integer.parseInt(parts[0]);
        int m = Integer.parseInt(parts[1]);
        return h * 60 + m;
    }
}
