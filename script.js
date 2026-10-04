/* =========================
   FIREBASE
========================= */

let firebaseDB = null;

let firestoreCollection = null;

let firestoreGetDocs = null;


async function initializeFirebase() {

    try {

        const firebaseModule =
            await import("./firebase.js");

        const firestoreModule =
            await import(
                "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
            );

        firebaseDB =
            firebaseModule.db;

        firestoreCollection =
            firestoreModule.collection;

        firestoreGetDocs =
            firestoreModule.getDocs;

        console.log(
            "Firebase connected successfully."
        );

    }
    catch (error) {

        console.error(
            "Firebase connection error:",
            error
        );

    }

}
initializeFirebase().then(function() {

    loadPublicGallery();

});

/* =========================
   GALLERY FILTER
========================= */

function filterGallery(category) {

    const cards = document.querySelectorAll(".gallery-card");


    cards.forEach(function(card) {

        if (category === "all") {

            card.style.display = "block";

        }

        else if (card.classList.contains(category)) {

            card.style.display = "block";

        }

        else {

            card.style.display = "none";

        }

    });

}

/* =========================
   LOAD ARTWORKS FROM FIREBASE
========================= */

async function loadPublicGallery() {

    const publicGallery =
        document.getElementById("publicGallery");


    if (!publicGallery) {

        return;

    }


    if (
        !firebaseDB ||
        !firestoreCollection ||
        !firestoreGetDocs
    ) {

        console.error(
            "Firebase is not ready."
        );

        return;

    }


    publicGallery.innerHTML =
        "<p>Loading artworks...</p>";


    try {

        const artworkSnapshot =
            await firestoreGetDocs(
                firestoreCollection(
                    firebaseDB,
                    "artworks"
                )
            );


        publicGallery.innerHTML =
            "";


        if (artworkSnapshot.empty) {

            publicGallery.innerHTML =
                "<p>No artwork available.</p>";

            return;

        }


        artworkSnapshot.forEach(
            function(docSnapshot) {

                const artwork =
                    docSnapshot.data();


                const artworkId =
                    docSnapshot.id;


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "gallery-card " +
                    artwork.category;


                card.dataset.artworkId =
                    artworkId;


                const likeKey =
                    "liked_artwork_" +
                    artworkId;


                const alreadyLiked =
                    localStorage.getItem(
                        likeKey
                    ) === "true";


                const likeText =
                    alreadyLiked
                        ? "❤️ Liked"
                        : "❤️ Like";


                const likeDisabled =
                    alreadyLiked
                        ? "disabled"
                        : "";


                card.innerHTML = `

                    <img
                        src="${artwork.photoUrl}"
                        alt="${artwork.title}">


                    <div class="card-content">

                        <h3>
                            ${artwork.title}
                        </h3>


                        <div class="social-actions">

                            <button
                                onclick="likePost(this)"
                                ${likeDisabled}>

                                ${likeText}

                                <span>
                                    ${artwork.likes || 0}
                                </span>

                            </button>


                            <button
                                onclick="commentPost(this)">

                                💬 Comment

                            </button>


                            <button
                                onclick="sharePost(this)">

                                📤 Share

                            </button>

                        </div>


                        <div class="comment-box"></div>

                    </div>

                `;


                publicGallery.appendChild(
                    card
                );


                loadCommentsForArtwork(
                    artworkId,
                    card.querySelector(
                        ".comment-box"
                    )
                );

            }
        );       


        console.log(
            "Public gallery loaded:",
            artworkSnapshot.size,
            "artworks"
        );

    }

    catch (error) {

        console.error(
            "Public gallery error:",
            error
        );


        publicGallery.innerHTML =
            "<p>Artwork load nahi ho paya.</p>";

    }

}


/* =========================
   LIKE BUTTON
========================= */

async function likePost(button) {

    const card =
        button.closest(
            ".gallery-card"
        );


    const artworkId =
        card.dataset.artworkId;


    if (!artworkId) {

        alert(
            "Artwork ID nahi mila."
        );

        return;

    }


    const likeKey =
        "liked_artwork_" +
        artworkId;


    /* =========================
       CHECK ALREADY LIKED
    ========================= */

    if (
        localStorage.getItem(
            likeKey
        ) === "true"
    ) {

        alert(
            "Aap is artwork ko already Like kar chuke hain."
        );

        return;

    }


    try {

        const firestoreModule =
            await import(
                "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
            );


        const docFunction =
            firestoreModule.doc;


        const updateDocFunction =
            firestoreModule.updateDoc;


        const incrementFunction =
            firestoreModule.increment;


        await updateDocFunction(

            docFunction(
                firebaseDB,
                "artworks",
                artworkId
            ),

            {
                likes:
                    incrementFunction(1)
            }

        );


        const countSpan =
            button.querySelector(
                "span"
            );


        let count =
            parseInt(
                countSpan.innerText
            ) || 0;


        count =
            count + 1;


        countSpan.innerText =
            count;


        button.innerHTML =
            "❤️ Liked <span>" +
            count +
            "</span>";


        button.disabled =
            true;


        /* =========================
           SAVE LIKE STATUS
        ========================= */

        localStorage.setItem(
            likeKey,
            "true"
        );


        console.log(
            "Like saved successfully."
        );

    }

    catch (error) {

        console.error(
            "Like save error:",
            error
        );


        alert(
            "Like save nahi ho paya."
        );

    }

}



/* =========================
   COMMENT BUTTON
========================= */

async function commentPost(button) {

    const card =
        button.closest(
            ".gallery-card"
        );


    const commentBox =
        card.querySelector(
            ".comment-box"
        );


    const artworkId =
        card.dataset.artworkId;


    if (!artworkId) {

        alert(
            "Artwork ID nahi mila."
        );

        return;

    }


    const comment =
        prompt(
            "Apna comment likhiye:"
        );


    if (
        comment === null ||
        comment.trim() === ""
    ) {

        return;

    }


    try {

        const firestoreModule =
            await import(
                "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
            );


        const collectionFunction =
            firestoreModule.collection;


        const addDocFunction =
            firestoreModule.addDoc;


        const serverTimestampFunction =
            firestoreModule.serverTimestamp;


        /* =========================
           SAVE COMMENT TO FIREBASE
        ========================= */

        await addDocFunction(

            collectionFunction(
                firebaseDB,
                "artworks",
                artworkId,
                "comments"
            ),

            {
                text:
                    comment.trim(),

                createdAt:
                    serverTimestampFunction()
            }

        );


        /* =========================
           SHOW COMMENT ON PAGE
        ========================= */

        const newComment =
            document.createElement(
                "div"
            );


        newComment.className =
            "comment-item";


        newComment.innerText =
            "💬 " +
            comment.trim();


        commentBox.appendChild(
            newComment
        );


        commentBox.style.display =
            "block";


        console.log(
            "Comment saved successfully."
        );

    }

    catch (error) {

        console.error(
            "Comment save error:",
            error
        );


        alert(
            "Comment save nahi ho paya."
        );

    }

}


/* =========================
   LOAD COMMENTS FROM FIREBASE
========================= */

async function loadCommentsForArtwork(
    artworkId,
    commentBox
) {

    if (
        !artworkId ||
        !commentBox
    ) {

        return;

    }


    try {

        const firestoreModule =
            await import(
                "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
            );


        const collectionFunction =
            firestoreModule.collection;


        const getDocsFunction =
            firestoreModule.getDocs;


        const commentSnapshot =
            await getDocsFunction(

                collectionFunction(
                    firebaseDB,
                    "artworks",
                    artworkId,
                    "comments"
                )

            );


        commentBox.innerHTML =
            "";


        commentSnapshot.forEach(
            function(commentDocument) {

                const commentData =
                    commentDocument.data();


                const commentItem =
                    document.createElement(
                        "div"
                    );


                commentItem.className =
                    "comment-item";


                commentItem.innerText =
                    "💬 " +
                    commentData.text;


                commentBox.appendChild(
                    commentItem
                );

            }
        );


        if (
            !commentSnapshot.empty
        ) {

            commentBox.style.display =
                "block";

        }

    }

    catch (error) {

        console.error(
            "Comments load error:",
            error
        );

    }

}


/* =========================
   SHARE BUTTON
========================= */

async function sharePost(button) {

    const card =
        button.closest(
            ".gallery-card"
        );


    if (!card) {

        return;

    }


    const titleElement =
        card.querySelector(
            "h3"
        );


    const imageElement =
        card.querySelector(
            "img"
        );


    const title =
        titleElement
            ? titleElement.innerText.trim()
            : "artwithshailesh Artwork";


    const imageUrl =
        imageElement
            ? imageElement.src
            : window.location.href;


    const shareData = {

        title:
            "artwithshailesh",

        text:
            title +
            " 🎨 by artwithshailesh",

        url:
            window.location.href

    };


    try {

        if (
            navigator.share
        ) {

            await navigator.share(
                shareData
            );

            console.log(
                "Artwork shared successfully."
            );

        }

        else {

            await navigator.clipboard.writeText(
                window.location.href
            );


            alert(
                "Artwork link copied! अब इसे WhatsApp या किसी भी app पर share कर सकते हैं."
            );

        }

    }

    catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            return;

        }


        console.error(
            "Share error:",
            error
        );

    }

}



/* =========================
   PAGE LOAD
========================= */

document.addEventListener("DOMContentLoaded", function() {

    filterGallery("all");
    
});