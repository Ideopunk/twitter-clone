import React, { useState, useEffect, useContext } from "react";
import { db, auth, storage } from "../../config/fbConfig";
import UserContext from "../context/context.js";
import Leaf from "../../assets/leaf-outline.svg";

import { ReactComponent as Quote } from "../../assets/quote-outline.svg";
import { ReactComponent as Retweet } from "../../assets/retweet-icon.svg";
import { ReactComponent as Like } from "../../assets/like-icon.svg";
import { ReactComponent as LikeFilled } from "../../assets/like-icon-filled.svg";
import { ReactComponent as Copy } from "../../assets/copy-icon.svg";
import { ReactComponent as Dots } from "../../assets/dots.svg";

const Tweet = (props) => {
	const [image, setImage] = useState("");
	const [dropdown, setDropdown] = useState(false);

	const { name, at, time, text, retweets, likes, replying, tweetID, tweeterID, userID } = props;
	const { userLikes, userFollows, userTweets } = useContext(UserContext);

	const liked = likes && likes.includes(userID); // has the user liked this tweet?
	const followed = userFollows.includes(tweeterID);
	const date = new Date(time.seconds * 1000);
	const likeAmount = likes ? likes.length : "";
	const retweetsAmount = retweets ? retweets.length : "";

	// tweet rendered
	useEffect(() => {
		console.log("rendered");
	}, []);

	// listen for auth status changes
	useEffect(() => {
		storage
			.ref("profile_pictures/" + tweeterID + ".png")
			.getDownloadURL()
			.then((url) => {
				setImage(url)
			})
			.catch((err) => {
				console.log(err);
				setImage(Leaf)
			});
	}, [tweeterID]);

	const toggleDropdown = () => {
		setDropdown(!dropdown);
	};

	const deleteTweet = (e) => {
		e.persist();
		import("../functions/deleteTweet.js").then((likeDB) =>
			likeDB.default(e, userTweets, userID)
		);
	};

	const like = (e) => {
		e.persist();
		import("../functions/likeDB.js").then((likeDB) => likeDB.default(e, userID, userLikes));
	};

	const unlike = (e) => {
		e.persist();
		import("../functions/unlike.js").then((unlike) => unlike.default(e, userID, userLikes));
	};

	const follow = (e) => {
		e.persist();
		import("../functions/follow.js").then((follow) => follow.default(e, userID, userFollows));
	};

	const unfollow = (e) => {
		e.persist();
		import("../functions/unfollow.js").then((unfollow) =>
			unfollow.default(e, userID, userFollows)
		);
	};

	return (
		<div className="tweet">
			<img className="profile-image" alt="user-profile" src={image} />
			<div className="tweet-main">
				<div className="tweet-top-data">
					<span className="tweeter-name">{name}</span>
					<span className="tweeter-at">{at}</span>
					<span className="tweet-time grey">{date.toDateString()}</span>
					<div style={{ marginLeft: "auto" }}>
						{dropdown ? (
							<Dropdown
								deleteTweet={deleteTweet}
								unfollow={unfollow}
								follow={follow}
								followed={followed}
								tweetID={tweetID}
								userID={userID}
								tweeterID={tweeterID}
							/>
						) : (
							""
						)}
						<Dots className="little-arrow" onClick={toggleDropdown} />
					</div>
				</div>
				{replying ? <p className="tweet-reply">Replying to {replying}</p> : ""}
				<p className="tweet-text">{text}</p>
				<div className="tweet-responses">
					<div className="tweet-svg-div grey">
						<Quote />
					</div>
					<div className="tweet-svg-div grey">
						<Retweet />
						{retweetsAmount}
					</div>
					<div
						value={tweetID}
						className={`tweet-svg-div grey ${liked && "liked"}`}
						onClick={liked ? unlike : like}
					>
						{liked ? <LikeFilled value={tweetID} /> : <Like value={tweetID} />}
						{likeAmount}
					</div>
					<div className="tweet-svg-div grey">
						<Copy />
					</div>
				</div>
			</div>
		</div>
	);
};

const Dropdown = (props) => {
	const { followed, tweetID, userID, tweeterID } = props;
	const [userTweet, setUserTweet] = useState(false);

	useEffect(() => {
		userID === tweeterID && setUserTweet(true);
	}, [userID, tweeterID]);

	return userTweet ? (
		<div className="tweet-dropdown" value={tweetID} onClick={props.deleteTweet}>
			Delete this tweet
		</div>
	) : (
		<div className="tweet-dropdown" onClick={followed ? props.unfollow : props.follow}>
			{followed ? "Unfollow this account" : "Follow this account"}
		</div>
	);
};

export default Tweet;
