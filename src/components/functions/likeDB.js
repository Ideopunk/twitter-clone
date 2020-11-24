import { db } from "../../config/fbConfig";
import notify from "./notify";

const likeDB = (tweet, userID, userLikes) => {
	const newList = [...userLikes, tweet];

	db.collection("tweets")
		.doc(tweet)
		.get()
		.then((snapshot) => {
			// uhh side effect!
			if (userID !== snapshot.data().userID) {
				notify("like", userID, snapshot.data().userID, tweet);
			}

			return snapshot.data().likes;
		})
		.then((likes) => {
			return [...(likes || []), userID];
		})
		.then((newLikes) => db.collection("tweets").doc(tweet).update({ likes: newLikes }))
		.then(() => {
			console.log(`added to tweet's likes`);
		})
		.then(() =>
			db
				.collection("users")
				.doc(userID)
				.update({ likes: newList })
				.then(() => console.log("added to user's likes"))
		);
};

export default likeDB;
