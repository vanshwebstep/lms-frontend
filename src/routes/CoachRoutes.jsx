import { Routes, Route, Navigate } from "react-router-dom";
import CoachLayout       from "../layouts/CoachLayout";
import CoachDashboard    from "../pages/coach/CoachDashboard";
import MyCourses         from "../pages/coach/MyCourses";
import CreateCourse      from "../pages/coach/CreateCourse";
import MyStudents        from "../pages/coach/MyStudents";

// Remaining pages — will be added batch by batch
// import CoachEarnings     from "../pages/coach/CoachEarnings";
// import CoachSettings     from "../pages/coach/CoachSettings";
// import ManageLessons     from "../pages/coach/ManageLessons";
// import ManageAssignments from "../pages/coach/ManageAssignments";
// import CreateQuiz        from "../pages/coach/CreateQuiz";
// import PricingPlans      from "../pages/coach/PricingPlans";

export default function CoachRoutes() {
  return (
    <Routes>
      <Route element={<CoachLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"    element={<CoachDashboard />} />
        <Route path="my-courses"   element={<MyCourses />} />
        <Route path="create-course" element={<CreateCourse />} />
        <Route path="my-students"  element={<MyStudents />} />
        {/* Placeholder routes — uncomment as pages are added */}
        {/* <Route path="earnings"       element={<CoachEarnings />} /> */}
        {/* <Route path="settings"       element={<CoachSettings />} /> */}
      </Route>
    </Routes>
  );
}