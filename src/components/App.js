import React, { useEffect, useState } from "react";
import { BrowserRouter, Redirect, Switch, Route } from "react-router-dom";
import { db, auth, storage } from "../config/fbConfig";
import LoaderContainer from "./reusables/LoaderContainer";
import Main from "./Main";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import UserContext from "./context/context.js";
import "../style/App.scss";
import Leaf from "../assets/leaf-outline.svg";

const App = () => {
	const [userID, setUserID] = useState(null);
	const [userImage, setUserImage] = useState(null);
	const [userAt, setUserAt] = useState(null);
	const [userName, setUserName] = useState(null);
	const [userFollows, setUserFollows] = useState([]);
	const [userFollowers, setUserFollowers] = useState([]);
	const [userTweets, setUserTweets] = useState([]);
	const [userLikes, setUserLikes] = useState([]);

	// listen for auth status changes
	useEffect(() => {
		console.log("use effect");
		auth.onAuthStateChanged((user) => {
			console.log(user);
			if (!user) {
				setUserID(null);
				setUserImage(null);
			} else {
				setUserID(user.uid);
				db.collection("users")
					.doc(user.uid)
					.get()
					.then((snapshot) => {
						const data = snapshot.data();
						console.log(data);
						setUserAt(data.at);
						setUserName(data.name);

						// set follows/ers if we have any.
						data.follows && setUserFollows(data.follows);
						data.followers && setUserFollowers(data.followers);
						data.tweets && setUserTweets(data.tweets);
						data.likes && setUserLikes(data.likes);
					});

				// set user image and header,
				storage
					.ref("profile_pictures/" + user.uid + ".png")
					.getDownloadURL()
					.then((url) => setUserImage(url))
					.catch(() => {
						setUserImage(Leaf);
					});
			}
		});
	}, []);

	return (
		<BrowserRouter>
			<div className="App">
				<UserContext.Provider
					value={{
						userID: userID,
						userImage: userImage,
						userAt: userAt,
						userName: userName,
						userFollows: userFollows,
						userFollowers: userFollowers,
						userTweets: userTweets,
						userLikes: userLikes,
					}}
				>
					<Switch>
						<Route exact path="/login">
							{userID ? <Redirect to="/" /> : <LoginPage />}
						</Route>
						<Route exact path="/signup">
							{userID ? <Redirect to="/" /> : <SignupPage />}
						</Route>
						<Route path="/">
							{/* This is bad for unlogged-in users */}
							{userID ? (
								<Main userID={userID} userAt={userAt} userImage={userImage} />
							) : (
								<LoaderContainer />
							)}
						</Route>
					</Switch>
				</UserContext.Provider>
			</div>
		</BrowserRouter>
	);
};

export default App;
