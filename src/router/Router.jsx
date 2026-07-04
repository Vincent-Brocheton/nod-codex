import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";

export default function Router() {
    return (
        <Routes>

            <Route element={<MainLayout />}>

                <Route
                    path="/"
                    element={<HomePage />}
                />

                <Route
                    path="/:section"
                    element={<HomePage />}
                />

                <Route
                    path="/:section/:slug"
                    element={<HomePage />}
                />

                <Route
                    path="/:section/:collectionKey/:groupValue"
                    element={<HomePage />}
                />

            </Route>

        </Routes>
    );
}