import React, { lazy, Suspense, useState, useEffect } from "react";
import Tweet from "./reusables/Tweet";
import { Link, useParams, useHistory, useLocation } from "react-router-dom";
import { ReactComponent as SideArrow } from "../assets/side-arrow-icon.svg";

import { db } from "../config/fbConfig";
import LoaderContainer from "./reusables/LoaderContainer";
const Feed = lazy(() => import("./reusables/Feed"));

const TweetAndReplies = (props) => {
	console.log(props)
	const { tweetID } = useParams();
	const [mainTweet, setMainTweet] = useState({});
	const [tweetDatas, setTweetDatas] = useState([]);

	const history = useHistory();
	const location = useLocation();

	console.log(history);
	console.log(location);

	console.log("tweet and replies");
	useEffect(() => {
		if (Object.keys(mainTweet).length > 0) {
			document.title = `${mainTweet.name} on Fake Twitter`;
		}
	}, [mainTweet]);

	// get the tweet
	useEffect(() => {
		db.collection("tweets")
			.doc(tweetID)
			.get()
			.then((doc) => {
				console.log(doc.data());
				setMainTweet({ ...doc.data(), id: doc.id });
			});
	}, [tweetID]);

	// get the replies
	useEffect(() => {
		db.collection("tweets")
			.where("replyTo", "==", tweetID)
			.get()
			.then((snapshot) => {
				let tempArray = [];
				snapshot.forEach((doc) => {
					// don't include replies
					tempArray.push({ ...doc.data(), id: doc.id });
				});
				return tempArray;
			})
			.then((tempArray) => {
				setTweetDatas(tempArray);
			});
	}, [tweetID]);

	return (
		<div className="home center-feed">
			<Link
				to={location.state.prevPath}
				className="profile-home-link"
				style={{ textDecoration: "none", color: "black" }}
			>
				<SideArrow />
				<div className="profile-home-link-text">
					<h3 className="no-dec">Tweet</h3>
				</div>
			</Link>
			<div style={{ height: "3.5rem" }}></div>
			<Tweet
				key={mainTweet.id}
				tweetID={mainTweet.id}
				tweeterID={mainTweet.userID}
				name={mainTweet.name}
				at={mainTweet.at}
				time={mainTweet.timeStamp}
				text={mainTweet.text}
				retweets={mainTweet.retweets}
				replyTo={mainTweet.replyTo}
				likes={mainTweet.likes}
				getReplies={false}
				replies={mainTweet.replies}
				big={true}
				imageCount={mainTweet.imageCount}
			/>
			{mainTweet.replies && (
				<Suspense fallback={<LoaderContainer />}>
					<Feed tweetDatas={tweetDatas} />
				</Suspense>
			)}
		</div>
	);
};

export default TweetAndReplies;

// relevant people side-link
