import React from "react";
import {useLocation} from 'react-router-dom';

const Home=() => {
	let location = useLocation();

	if (location.pathname !== '/HomePage')
		return (<a href="/"> <i className="bi bi-house"></i></a>);
	return <></>;
};

export default Home;
