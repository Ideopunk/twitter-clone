import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { ReactComponent as Garbage } from "../../assets/garbage.svg";
import { ReactComponent as ProfileIcon } from "../../assets/profile-outline.svg";
import LoaderContainer from "./LoaderContainer";
import { useHistory } from "react-router-dom";

const Cover = lazy(() => import("./Cover"));

const Warning = lazy(() => import("./Warning"));

const TweetDropdown = (props) => {
	const { followed, tweetID, userID, tweeterID, userTweets, replyTo, prevPath } = props;
	const [userTweet, setUserTweet] = useState(false);
	const [warning, setWarning] = useState(false);

	const ref = useRef(null);

	const history = useHistory();

	const deleteTweet = (e) => {
		e.stopPropagation();
		toggleWarning(false);
		if (userID) {
			import("../functions/deleteTweet.js").then((deleteTweet) => {
				deleteTweet.default(tweetID, userTweets, userID, replyTo);
				history.push("/");
			});
		}
		// props.deleteToast(true);
	};

	const toggleWarning = () => {
		const body = document.body;

		if (warning) {
			document.body.style.position = "";
			window.scrollTo(0, -parseInt(body.style.top));
		}

		setWarning(!warning);
	};

	// freeze if modal up
	useEffect(() => {
		const body = document.body;
		const scroll = window.scrollY;

		if (warning) {
			document.body.style.position = "fixed";
			body.style.top = `-${scroll}px`;
		}
	}, [warning]);

	// change options depending on whose tweet it is
	useEffect(() => {
		userID === tweeterID && setUserTweet(true);
	}, [userID, tweeterID]);

	// clicks outside the dropdown should close the dropdown
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (ref.current && !ref.current.contains(e.target)) {
				props.toggle(e);
			}
		};

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [props]);

	return userTweet ? (
		<div
			className="tweet-dropdown"
			value={tweetID}
			onClick={(e) => {
				e.stopPropagation();
				setWarning(true);
			}}
			ref={ref}
		>
			<Garbage style={{ fill: "red" }} />
			<span style={{ color: "red" }}>Delete this tweet</span>
			{warning && (
				<Suspense fallback={<LoaderContainer />}>
					<Cover toggle={toggleWarning}>
						<Warning
							cancel={toggleWarning}
							title={`Delete Tweet?`}
							action={deleteTweet}
							actionName="Delete"
							message={`This can't be undone and it will be removed from your profile, 
									the timeline of any accounts that follow you, and from Fake Twitter search results.`}
						/>
					</Cover>
				</Suspense>
			)}
		</div>
	) : (
		<div
			className="tweet-dropdown"
			value={tweeterID}
			onClick={followed ? props.unfollow : props.follow}
			ref={ref}
		>
			<ProfileIcon className="tweet-icon" />
			{followed ? "Unfollow this account" : "Follow this account"}
		</div>
	);
};

export default TweetDropdown;
