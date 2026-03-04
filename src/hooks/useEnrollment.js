import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import api from "../configs/api";
import { setEnrollments, upsertEnrollment } from "../store/features/authSlice";

export const useEnrollment = () => {
    const dispatch = useDispatch();
    const enrollments = useSelector((s) => s.auth.enrollments);

    // Load all enrollments for the current user and store in Redux.
    // Called once on dashboard mount.
    const fetchEnrollments = useCallback(async () => {
        try {
            const { data } = await api.get("/api/enrollments/my");
            dispatch(setEnrollments(data.enrollments ?? []));
        } catch (err) {
            console.error("Failed to fetch enrollments:", err.message);
        }
    }, [dispatch]);

    // Returns the enrollment for a given courseCode e.g. "comp3609"
    const getEnrollment = useCallback(
        (courseCode) => {
            if (!courseCode) return null;

            return (
                enrollments.find(
                    (e) =>
                        e.course?.courseCode?.toLowerCase() ===
                        courseCode.toLowerCase()
                ) ?? null
            );
        },
        [enrollments]
    );

    // Student selects or changes their group for a course.
    // Calls POST /api/enrollments/join and updates Redux.
    const joinGroup = useCallback(
        async (courseCode, groupId) => {
            const { data } = await api.post("/api/enrollments/join", {
                courseCode,
                groupId,
            });
            dispatch(upsertEnrollment(data.enrollment));
            return data.enrollment;
        },
        [dispatch]
    );

    return { enrollments, fetchEnrollments, getEnrollment, joinGroup };
};