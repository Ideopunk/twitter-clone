import React, { useState, useEffect, useContext } from "react";
import { db } from "../config/fbConfig";
import UserContext from "./context/context.js";
import LoaderContainer from "./reusables/LoaderContainer";

import Composer from "./reusables/Composer";
import Feed from "./reusables/Feed";

const Home = (props) => {
	const { userID } = useContext(UserContext);

	const [tweetDatas, setTweetDatas] = useState([]);

	useEffect(() => {
		document.title = "Home / Fake Twitter";
	}, []);

	useEffect(() => {
		db.collection("users")
			.where("followers", "array-contains", userID)
			.get()
			.then((snapshot) => {
				console.log(snapshot);
				let tempArray = [];

				// for each user we follow...
				snapshot.forEach((doc) => {
					console.log(doc.data());
					console.log(doc.data().tweets);
					doc.data().tweets && tempArray.push(...doc.data().tweets);
				});

				db.collection("tweets")
					.orderBy("timeStamp", "desc")
					.get()
					.then((snapshot) => {
						console.log(snapshot);
						console.log(tempArray);
						let finalArray = [];
						snapshot.forEach((doc) => {
							if (tempArray.includes(doc.id) && !doc.data().replyTo) {
								finalArray.push({ ...doc.data(), id: doc.id });
							}
						});
						console.log(finalArray);
						setTweetDatas(finalArray);
					});
			});
	}, [userID]);

	return (
		<div className="home center-feed">
			<h3 className="home-title">Home</h3>
			<Composer />
			{tweetDatas.length ? <Feed tweetDatas={tweetDatas} /> : <LoaderContainer />}
		</div>
	);
};

export default Home;
