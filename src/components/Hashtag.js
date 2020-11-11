import React, { lazy, Suspense, useState, useEffect } from "react";
import { db } from "../config/fbConfig";

import Tweet from "./reusables/Tweet";
import { Link, useParams } from "react-router-dom";
import { ReactComponent as SideArrow } from "../assets/side-arrow-icon.svg";
import Search from "./reusables/Search";
const Feed = lazy(() => import("./reusables/Feed"));

const Hashtag = () => {
	const { tag } = useParams();

	useEffect(() => {
		console.log(tag);
	}, [tag]);

	const [tweetDatas, setTweetDatas] = useState([]);

	useEffect(() => {
		db.collection("tweets")
			.where("hashtags", "array-contains", tag)
			.get()
			.then((snapshot) => {
				let tempArray = [];
				snapshot.forEach((doc) => {
					// don't include replies
					tempArray.push({ ...doc.data(), id: doc.id });
				});
				setTweetDatas(tempArray);
			});
	}, [tag]);

	return (
		<div className="home center-feed">
			<div className="profile-home-link">
				<Link to="/" style={{ textDecoration: "none", color: "black" }}>
					<SideArrow />
				</Link>
				<div className="profile-home-link-text">
					<Search defaultValue={"#" + tag} />
				</div>
			</div>
			<div style={{ height: "3.5rem" }}></div>
			<Feed tweetDatas={tweetDatas} />
		</div>
	);
};

export default Hashtag;
