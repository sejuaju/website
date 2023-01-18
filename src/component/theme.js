import Header from "./Header";
import Sidebar from "./Sidebar";


import { Route } from "react-router-dom";

export const Theme = ({ component: Component, roles, ...rest }) => (
    <Route
        {...rest}
        render={(props) => {
            // authorised so return component
            return (
                <div>
                    <Header />
                    <Sidebar />
                    <Component {...props} />

                </div>
            );
        }}
    />
);
export default Theme;