import React, { useState, useEffect, useContext, lazy, Suspense } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";

import { db, storage } from "../../config/fbConfig";
import UserContext from "../context/context.js";
import Leaf from "../../assets/leaf-outline.svg";
import LoaderContainer from "./LoaderContainer";
import DeadTweet from "./DeadTweet";
import { CopyToClipboard } from "react-copy-to-clipboard";
import PreviewLink from "./Preview";

import { ReactComponent as Quote } from "../../assets/quote-outline.svg";
import { ReactComponent as Retweet } from "../../assets/retweet-icon.svg";
import { ReactComponent as Like } from "../../assets/like-icon.svg";
import { ReactComponent as LikeFilled } from "../../assets/like-icon-filled.svg";
import { ReactComponent as Copy } from "../../assets/copy-icon.svg";
import { ReactComponent as Dots } from "../../assets/dots.svg";

const Cover = lazy(() => import("./Cover"));
const Composer = lazy(() => import("./Composer"));
const UsersList = lazy(() => import("./UsersList"));
const TweetDropdown = lazy(() => import("./TweetDropdown"));
const reactStringReplace = require("react-string-replace");
const Toast = lazy(() => import("./Toast"));

const Tweet = (props) => {
	const [image, setImage] = useState("");
	const [timeSince, setTimeSince] = useState(null);
	const [dropdown, setDropdown] = useState(false);
	const [reply, setReply] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [modal, setModal] = useState("");
	const [toast, setToast] = useState("");
	const [pics, setPics] = useState([]);
	const [retweetedBy, setRetweetedBy] = useState("");
	const [originalTweet, setOriginalTweet] = useState(null);

	const {
		name,
		at,
		time,
		text,
		retweets,
		likes,
		replyTo,
		replies,
		tweetID,
		tweeterID,
		big,
		imageCount,
		original,
		checkReply,
		deleteToast,
	} = props;

	const { userID, userAt, userLikes, userFollows, userTweets, userRetweets } = useContext(
		UserContext
	);

	const liked = likes && likes.includes(userID); // has the user liked this tweet?
	const followed = userFollows && userFollows.includes(tweeterID); // does the user follow this tweet?
	const isRetweet = userRetweets && userRetweets.includes(tweetID);
	const likeAmount = likes ? likes.length : "";
	const retweetsAmount = retweets ? retweets.length : "";
	const repliesAmount = replies ? replies.length : "";

	const location = useLocation();
	let history = useHistory();

	// if this is a reply, get the original tweet
	useEffect(() => {
		let mounted = true;

		if (replyTo) {
			db.collection("tweets")
				.doc(replyTo)
				.get()
				.then((doc) => {
					const data = doc.data();
					if (doc.exists) {
						if (checkReply && mounted) {
							console.log("check reply");
							checkReply(doc.id);
						}
						console.log("live original tweet");
						if (mounted) {
							console.log("mounted live og tweet");
							setOriginalTweet(
								<Tweet
									key={doc.id}
									tweetID={doc.id}
									tweeterID={data.userID}
									name={data.name}
									at={data.at}
									time={data.timeStamp}
									text={data.text}
									retweets={data.retweets}
									replyTo={data.replyTo}
									likes={data.likes}
									getReplies={false}
									replies={data.replies}
									imageCount={data.imageCount}
									// "change"? Hmmm.
									deleteToast={deleteToast}
									original={true}
								/>
							);
						}
					} else {
						console.log("dead tweet");
						if (mounted) {
							setOriginalTweet(<DeadTweet />);
						}
					}
				});
		}
		return () => (mounted = false);
	}, [big, replyTo, deleteToast, checkReply]);

	const hashedText = reactStringReplace(text, /(#\w+)/g, (match, i) => (
		<Link
			to={`/hashtag/${match.slice(1)}`}
			key={i + match}
			className="hover-under begotten-link"
		>
			{match}
		</Link>
	));
	const linkedText = reactStringReplace(hashedText, /(@\w+)/g, (match, i) => (
		<PreviewLink
			to={`/${match.slice(1)}`}
			key={i + match}
			className="hover-under begotten-link"
		>
			{match}
		</PreviewLink>
	));

	// do we have pictures?
	useEffect(() => {
		"pics use effect";

		let mounted = true;
		if (imageCount) {
			let tempArray = [];
			for (let i = 0; i < imageCount; i++) {
				storage
					.ref("tweet_pictures/" + tweetID + "/" + i + ".png")
					.getDownloadURL()
					.then((url) => {
						const jsx = (
							<a
								href={url}
								target="_blank"
								rel="noreferrer"
								className="image-container"
								onClick={(e) => {
									e.stopPropagation();
								}}
								key={url}
							>
								<img
									src={url}
									alt="user-submitted-pic"
									className="composer-preview-image"
								/>
							</a>
						);
						tempArray.push(jsx);
					})
					.catch((err) => {
						console.log(err);
					});
			}
			if (mounted) {
				setPics(tempArray);
			}
		}
		return () => (mounted = false);
	}, [imageCount, tweetID]);

	// is this a retweet?
	useEffect(() => {
		"retweet use effect";

		let mounted = true;
		if (mounted) {
			if (retweets && retweets.includes(userID)) {
				setRetweetedBy(userAt);
			} else if (retweets && retweets.length > 0) {
				db.collection("users")
					// get the latest person to retweet
					.doc(retweets[retweets.length - 1])
					.get()
					.then((doc) => setRetweetedBy(doc.at));
			} else {
				setRetweetedBy("");
			}
		}

		return () => (mounted = false);
	}, [retweets, userID, userAt]);

	// get picture for tweet, set to Leaf if no picture found.
	useEffect(() => {
		console.log("picture use effect");
		let mounted = true;

		if (mounted) {
			storage
				.ref("profile_pictures/" + tweeterID + ".png")
				.getDownloadURL()
				.then((url) => {
					setImage(url);
				})
				.catch((err) => {
					console.log(err);
					setImage(Leaf);
				});
			console.log(time + text);
			console.log(time.toDate())
			console.log(new Date(time.seconds * 1000));

			//set how long ago the tweet was
			if (time && !big) {
				import("../functions/elapser.js").then((elapser) =>
					setTimeSince(elapser.default(time))
				);
			} else if (time) {
				setTimeSince(new Date(time.seconds * 1000).toDateString());
			}
		}

		return () => (mounted = false);
	}, [tweeterID, time, text, big]);

	const toggleDropdown = (e) => {
		e.stopPropagation();
		if (userID) {
			setDropdown(!dropdown);
		}
	};

	const toggleReply = (e) => {
		if (e) {
			e.stopPropagation();
		}
		if (userID) {
			setReply(!reply);
		}
	};

	const deleteTweet = (e) => {
		e.stopPropagation();
		if (userID) {
			import("../functions/deleteTweet.js").then((deleteTweet) =>
				deleteTweet.default(tweetID, userTweets, userID)
			);
		}
		props.deleteToast(true);
	};

	const like = (e) => {
		e.stopPropagation();
		if (userID) {
			import("../functions/likeDB.js").then((likeDB) =>
				likeDB.default(tweetID, userID, userLikes)
			);
		}
	};

	const unlike = (e) => {
		e.stopPropagation();
		if (userID) {
			import("../functions/unlike.js").then((unlike) =>
				unlike.default(tweetID, userID, userLikes)
			);
		}
	};

	const follow = (e) => {
		e.stopPropagation();
		if (userID) {
			import("../functions/follow.js").then((follow) =>
				follow.default(tweeterID, userID, userFollows)
			);
		}
	};

	const unfollow = (e) => {
		e.stopPropagation();
		if (userID) {
			import("../functions/unfollow.js").then((unfollow) =>
				unfollow.default(tweeterID, userID, userFollows)
			);
		}
	};

	const retweet = (e) => {
		e.stopPropagation();
		if (userID) {
			!userRetweets.includes(tweetID) &&
				import("../functions/retweet.js").then((retweet) =>
					retweet.default(tweetID, userID, userRetweets)
				);
		}
	};

	const unRetweet = (e) => {
		e.stopPropagation();
		if (userID) {
			import("../functions/unRetweet.js").then((unRetweet) =>
				unRetweet.default(tweetID, userID)
			);
		}
	};

	// toasts last one second.
	useEffect(() => {
		let timer = null;
		if (toast) {
			timer = setTimeout(() => {
				setToast(false);
			}, 1000);
		}

		return () => clearTimeout(timer);
	}, [toast]);

	const imageLoad = () => {
		setImageLoaded(true);
	};

	const redirect = (e) => {
		console.log(e);
		console.log(e.target);
		history.push({ pathname: `/tweet/${tweetID}`, state: { prevPath: location.pathname } });
	};

	return (
		<>
			{replyTo && originalTweet}
			<div
				className={`tweet ${imageLoaded ? "" : "hide"} ${big ? "big" : "pad"} ${
					original ? "original" : ""
				}`}
				onClick={redirect}
			>
				{retweetedBy && (
					<PreviewLink to={`/${retweetedBy}`} className="hover-under">
						<div className="retweeted-by">
							<Retweet />
							<p>Retweeted by {retweetedBy}</p>
						</div>
					</PreviewLink>
				)}

				<div className={`tweet-inside ${big ? "big-tweet-inside" : ""}`}>
					{big ? (
						<div className="tweet-top-data pad">
							<PreviewLink to={`/${at}`}>
								{/* // <Link to={`/${at}`} onMouseOver=> */}
								{image ? (
									<img
										className={`profile-image`}
										alt="user-profile"
										src={image}
										onLoad={imageLoad}
									/>
								) : (
									<div className="profile-image" />
								)}
							</PreviewLink>
							<PreviewLink to={`/${at}`} style={{ textDecoration: "none" }}>
								<p className="tweeter-name">{name}</p>
								<p className="tweeter-at">@{at}</p>
							</PreviewLink>

							<div style={{ marginLeft: "auto", position: "relative" }}>
								<Dots className="dots grey" onClick={(e) => toggleDropdown(e)} />
								{dropdown && (
									<Suspense fallback={<LoaderContainer absolute={true} />}>
										<TweetDropdown
											deleteTweet={deleteTweet}
											unfollow={unfollow}
											follow={follow}
											followed={followed}
											tweetID={tweetID}
											userID={userID}
											tweeterID={tweeterID}
											toggle={toggleDropdown}
										/>
									</Suspense>
								)}
							</div>
						</div>
					) : image ? (
						<PreviewLink
							to={`/${at}`}
							className={`profile-image ${original ? "grey-line" : ""}`}
						>
							<img
								className={`profile-image `}
								alt="user-profile"
								src={image}
								onLoad={imageLoad}
							/>
						</PreviewLink>
					) : (
						<PreviewLink to={`/${at}`}>
							<div className="profile-image" />
						</PreviewLink>
					)}

					<div className="tweet-main">
						{!big && (
							<div className="tweet-top-data">
								<PreviewLink to={`/${at}`} style={{ textDecoration: "none" }}>
									<span className="tweeter-name hover-under">{name}</span>
									<span className="tweeter-at hover-under">{`@${at}`}</span>
								</PreviewLink>
								<Link
									to={{
										pathname: `/tweet/${tweetID}`,
										state: { prevPath: location.pathname },
									}}
									style={{ textDecoration: "none", color: "black" }}
								>
									<span className="tweet-time hover-under grey">{timeSince}</span>
								</Link>
								<div style={{ marginLeft: "auto", position: "relative" }}>
									<Dots className="dots" onClick={(e) => toggleDropdown(e)} />
									{dropdown && (
										<Suspense fallback={<LoaderContainer absolute={true} />}>
											<TweetDropdown
												deleteTweet={deleteTweet}
												unfollow={unfollow}
												follow={follow}
												followed={followed}
												tweetID={tweetID}
												userID={userID}
												tweeterID={tweeterID}
												toggle={toggleDropdown}
											/>{" "}
										</Suspense>
									)}
								</div>
							</div>
						)}
						{originalTweet && big ? (
							<p className="grey replying-to ">
								Replying to{" "}
								<PreviewLink
									to={`/${originalTweet.props.at}`}
									className="hover-under begotten-link"
								>
									@{originalTweet.props.at}
								</PreviewLink>
							</p>
						) : (
							""
						)}
						<p className={`tweet-text ${big ? "big-tweet-text" : ""}`}> {linkedText}</p>

						{imageCount ? (
							imageCount > 1 ? (
								<div className="preview-images">
									<div className="preview-images-half">
										{pics.slice(0, Math.round(pics.length / 2))}
									</div>
									<div className="preview-images-half">
										{pics.slice(Math.round(pics.length / 2))}
									</div>
								</div>
							) : (
								<div className="preview-images">{pics}</div>
							)
						) : (
							""
						)}
						{big && <p className="pad grey">{timeSince}</p>}

						{/* If this is a main tweet and you have any retweets or likes, show this div */}
						{big && (retweetsAmount > 0 || likeAmount > 0) && (
							<div className={`big-tweet-data`}>
								{retweetsAmount > 0 && (
									<p onClick={() => setModal("retweets")} className="hover-under">
										<span className="bold">{retweetsAmount}</span>{" "}
										<span>retweet{retweetsAmount > 1 && "s"}</span>
									</p>
								)}
								{likeAmount > 0 && (
									<p onClick={() => setModal("likes")} className="hover-under">
										<span className="bold">{likeAmount}</span>{" "}
										<span>like{likeAmount > 1 && "s"}</span>
									</p>
								)}
							</div>
						)}

						<div className={`tweet-responses ${big ? "big-tweet-responses" : ""}`}>
							<div className="tweet-svg-div grey reply-div" onClick={toggleReply}>
								<div className="tweet-svg-holder">
									<Quote />
								</div>
								{!big && (repliesAmount || "")}
							</div>
							<div
								className={`tweet-svg-div grey retweet-div ${
									isRetweet ? "active-retweet" : ""
								}`}
								onClick={isRetweet ? unRetweet : retweet}
							>
								<div className="tweet-svg-holder">
									<Retweet />
								</div>
								{!big && (retweetsAmount || "")}
							</div>
							<div
								value={tweetID}
								className={`tweet-svg-div grey like-div ${liked && "liked"}`}
								onClick={liked ? unlike : like}
							>
								<div className="tweet-svg-holder">
									{liked ? (
										<LikeFilled value={tweetID} />
									) : (
										<Like value={tweetID} />
									)}
								</div>
								{!big && (likeAmount || "")}
							</div>
							<div className="tweet-svg-div grey copy-div">
								<CopyToClipboard text={`/tweet/${tweetID}`}>
									<div
										className="tweet-svg-holder"
										onClick={(e) => {
											e.stopPropagation();
											setToast(true);
										}}
									>
										<Copy />
									</div>
								</CopyToClipboard>
							</div>
						</div>
					</div>
					{reply && (
						<Suspense fallback={<LoaderContainer />}>
							<Cover toggle={toggleReply}>
								<Composer
									modal={true}
									replyData={props}
									replyImage={image}
									replyTimeSince={timeSince}
									toggle={toggleReply}
								/>
							</Cover>
						</Suspense>
					)}
				</div>
				{modal ? (
					<Suspense fallback={<LoaderContainer />}>
						<Cover toggle={() => setModal("")}>
							<UsersList type={modal} tweetID={tweetID} clear={() => setModal("")} />{" "}
						</Cover>
					</Suspense>
				) : (
					""
				)}
				{toast ? (
					<Suspense fallback={<LoaderContainer />}>
						<Toast message="Tweet copied" />
					</Suspense>
				) : (
					""
				)}
			</div>
		</>
	);
};

export default Tweet;
