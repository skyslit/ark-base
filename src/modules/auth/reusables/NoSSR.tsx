import React from "react";

export default (props) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    React.useEffect(() => {
        setIsLoaded(true);
    }, []);

    return <>{isLoaded === true ? props.children : ""}</>;
};