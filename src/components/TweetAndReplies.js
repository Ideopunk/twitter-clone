import React, { lazy, Suspense, useState, useEffect } from "react";
import Tweet from "./reusables/Tweet";
import { Link, useParams, useLocation } from "react-router-dom";
import { ReactComponent as SideArrow } from "../assets/side-arrow-icon.svg";

import { db } from "../config/fbConfig";
import LoaderContainer from "./reusables/LoaderContainer";
const Feed = lazy(() => import("./reusables/Feed"));

const TweetAndReplies = (props) => {
	const { tweetID } = useParams();
	const [mainTweet, setMainTweet] = useState({});
	const [tweetDatas, setTweetDatas] = useState([]);

	const location = useLocation();

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
				to={location.state ? location.state.prevPath : "/"}
				className="top-link"
				style={{ textDecoration: "none", color: "black" }}
			>
				<div className="tweet-svg-holder">
					<SideArrow />
				</div>
				<div className="top-link-text">
					<h3 className="no-dec">Tweet</h3>
				</div>
			</Link>
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
