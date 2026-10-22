/* =========================
   FIREBASE
========================= */

let firebaseDB = null;
let firebaseAuth = null;
let firestoreDeleteDoc = null;
// Shailesh Admin UID
const SHAILLESH_ADMIN_UID = "19A05sjG5sQJgypC3LW2Taeoio72";
function isShaileshAdmin(user) {
    return Boolean(
        user &&
        user.uid === SHAILLESH_ADMIN_UID
    );
}

let firestoreCollection = null;

let firestoreGetDocs = null;

let firestoreDoc = null;

let firestoreGetDoc = null;
let firestoreOnSnapshot = null;

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
        firebaseAuth =
            firebaseModule.auth;
        const { onAuthStateChanged } = await import(
            "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js"
        );

        onAuthStateChanged(firebaseAuth, function(user) {
            console.log(
                user ? "Admin login hai." : "Admin logout hai."
            );

            document.querySelectorAll(".delete-comment-btn, .delete-reply-btn")
                .forEach(function(button) {
                    button.remove();
                });

            if (user && isShaileshAdmin(user)) {
                document.querySelectorAll(".comment-box, .comments-container")
                    .forEach(function(box) {
                        if (typeof box._renderComments === "function") {
                            box._renderComments();
                        }
                    });
            }
        });
        firestoreDeleteDoc =
            firestoreModule.deleteDoc;

        firestoreCollection =
            firestoreModule.collection;

        firestoreGetDocs =
            firestoreModule.getDocs;

        firestoreDoc =
            firestoreModule.doc;

        firestoreGetDoc =
            firestoreModule.getDoc;

        firestoreOnSnapshot =
            firestoreModule.onSnapshot;

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

    loadWebsiteSettings();

    loadPublicGallery();

    loadPublicBackgroundPhoto();

});

/* =========================
   WEBSITE SETTINGS
========================= */
let socialSettingsListenerStarted = false;
async function loadWebsiteSettings() {

    try {

        const websiteRef =
            firestoreDoc(
                firebaseDB,
                "settings",
                "website"
            );

        const websiteSnapshot =
            await firestoreGetDoc(
                websiteRef
            );

        if (
            !websiteSnapshot.exists()
        ) {

            console.log(
                "Website settings not found."
            );

            return;
        }

        const websiteData =
            websiteSnapshot.data();

        console.log(
            "Website settings loaded:",
            websiteData
        );
        const whatsappContactBtn =
            document.getElementById(
                "whatsappContactBtn"
            );

        if (
            whatsappContactBtn &&
            websiteData.contact
        ) {

            const cleanNumber =
                websiteData.contact
                    .replace(
                        /[^0-9]/g,
                        ""
                    );

            whatsappContactBtn.href =
                "https://wa.me/" +
                cleanNumber;

        }

        const publicWebsiteName =
            document.getElementById(
                "publicWebsiteName"
            );

        if (
            publicWebsiteName &&
            websiteData.name
        ) {

            publicWebsiteName.innerText =
                websiteData.name;

        }


        const publicWebsiteDescription =
            document.getElementById(
                "publicWebsiteDescription"
            );

        if (
            publicWebsiteDescription &&
            websiteData.description
        ) {

            publicWebsiteDescription.innerText =
                websiteData.description;

        }
        /* =========================
           LOAD PUBLIC PROFILE PHOTO
        ========================= */

        const profileRef =
            firestoreDoc(
                firebaseDB,
                "settings",
                "profile"
            );

        firestoreOnSnapshot(
            profileRef,
            function(profileSnapshot) {

                if (!profileSnapshot.exists()) {
                    return;
                }

                const profileData =
                    profileSnapshot.data();

                const publicProfilePhoto =
                    document.getElementById(
                        "publicProfilePhoto"
                    );

                if (publicProfilePhoto) {

                    if (profileData.photoUrl) {

                        publicProfilePhoto.onload =
                            function() {
                                publicProfilePhoto.style.visibility =
                                    "visible";
                            };

                        publicProfilePhoto.onerror =
                            function() {
                                console.error(
                                    "Profile photo could not load."
                                );
                            };

                        publicProfilePhoto.src =
                            profileData.photoUrl;

                    } else {

                        publicProfilePhoto.src =
                            "images/shailesh.jpg";

                        publicProfilePhoto.style.visibility =
                            "visible";
                    }
                }

            },
            function(error) {

                console.error(
                    "Public profile photo error:",
                    error
                );

            }
        );
        const socialRef =
            firestoreDoc(
                firebaseDB,
                "settings",
                "social"
            );

        if (!socialSettingsListenerStarted) {

            socialSettingsListenerStarted = true;

            firestoreOnSnapshot(
                socialRef,
                function(socialSnapshot) {

                    if (!socialSnapshot.exists()) {
                        return;
                    }

                    const socialData =
                        socialSnapshot.data();


                    if (socialData.youtube) {
                        loadYouTubeVideos(socialData.youtube);
                    }


                    const whatsappNumber =
                        socialData.whatsapp ||
                        socialData.mobileNumber;

                    const whatsappContactBtn =
                        document.getElementById(
                            "whatsappContactBtn"
                        );

                    if (whatsappContactBtn && whatsappNumber) {
                        const cleanNumber =
                            whatsappNumber.replace(/[^0-9]/g, "");

                        whatsappContactBtn.href =
                            "https://wa.me/" + cleanNumber;
                    }
                    const publicInstagramBtn =
                        document.getElementById(
                            "publicInstagramBtn"
                        );

                    if (publicInstagramBtn) {
                        publicInstagramBtn.href =
                            socialData.instagram || "#";
                    }

                    const publicYoutubeBtn =
                        document.getElementById(
                            "publicYoutubeBtn"
                        );

                    const visitYoutubeChannelBtn =
                        document.getElementById(
                            "visitYoutubeChannelBtn"
                        );

                    if (visitYoutubeChannelBtn) {
                        visitYoutubeChannelBtn.href =
                            socialData.youtube ||
                            "https://youtube.com/@artwithshailesh";
                    }

                    if (publicYoutubeBtn) {
                        publicYoutubeBtn.href =
                            socialData.youtube || "#";
                    }

                    const publicLinkedinBtn =
                        document.getElementById(
                            "publicLinkedinBtn"
                        );

                    if (publicLinkedinBtn) {
                        publicLinkedinBtn.href =
                            socialData.linkedin || "#";
                    }

                },
                function(error) {

                    console.error(
                        "Social settings listener error:",
                        error
                    );

                }
            );

        }

    }
    catch (error) {

        console.error(
            "Website settings load error:",
            error
        );

    }

}

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
   REAL-TIME PUBLIC GALLERY
========================= */

let publicGalleryUnsubscribers = [];

async function loadPublicGallery() {
    const publicGallery =
        document.getElementById("publicGallery");

    if (!publicGallery) {
        return;
    }

    try {
        const firestoreModule = await import(
            "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
        );

        const onSnapshot = firestoreModule.onSnapshot;
        const collection = firestoreModule.collection;

        // Stop any previous listeners
        publicGalleryUnsubscribers.forEach(function(unsubscribe) {
            unsubscribe();
        });

        publicGalleryUnsubscribers = [];

        publicGallery.innerHTML = "<p>Loading artworks...</p>";

        let artworksData = [];
        let photosData = [];
        let artworksReady = false;
        let photosReady = false;

        function renderGallery() {
            if (!artworksReady || !photosReady) {
                return;
            }

            publicGallery.innerHTML = "";

            const allPhotos = [
                ...artworksData,
                ...photosData
            ];

            if (allPhotos.length === 0) {
                publicGallery.innerHTML =
                    "<p>No photos available.</p>";
                return;
            }

            allPhotos.forEach(function(item) {
                const artwork = item.data;
                const artworkId = item.id;

                const card = document.createElement("div");

                const category = String(artwork.category || "all")
                    .toLowerCase()
                    .replace(/[^a-z0-9_-]/g, "");

                card.className = "gallery-card " + category;
                card.dataset.artworkId = artworkId;

                const imageUrl =
                    artwork.photoUrl ||
                    artwork.imageUrl ||
                    artwork.image ||
                    "";

                const title =
                    artwork.title || "artwithshailesh Artwork";

                const likeKey = "liked_artwork_" + artworkId;
                const alreadyLiked =
                    localStorage.getItem(likeKey) === "true";

                if (imageUrl) {
                    const image = document.createElement("img");

                    image.src = imageUrl;
                    image.alt = title;
                    image.loading = "lazy";

                    image.onerror = function() {
                        image.style.display = "none";
                    };

                    card.appendChild(image);
                }

                const content = document.createElement("div");
                content.className = "card-content";

                const heading = document.createElement("h3");
                heading.textContent = title;
                content.appendChild(heading);

                const actions = document.createElement("div");
                actions.className = "social-actions";

                const likeButton = document.createElement("button");
                likeButton.disabled = alreadyLiked;
                likeButton.innerHTML =
                    (alreadyLiked ? "❤️ Liked" : "❤️ Like") +
                    " <span>" + (Number(artwork.likes) || 0) +
                    "</span>";

                likeButton.addEventListener("click", function() {
                    likePost(likeButton);
                });

                actions.appendChild(likeButton);

                
                const commentButton = document.createElement("button");
                commentButton.textContent = "💬 Comment";

                commentButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                commentButton.addEventListener("click", function() {
                    const isOpen =
                        commentBox.style.display === "block";

                    if (isOpen) {
                        commentBox.style.display = "none";

                        commentButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    } else {
                        commentBox.style.display = "block";

                        commentButton.setAttribute(
                            "aria-expanded",
                            "true"
                        );

                        commentPost(commentButton);
                    }
                });

                actions.appendChild(commentButton);


                const shareButton = document.createElement("button");
                shareButton.textContent = "📤 Share";

                shareButton.addEventListener("click", function() {
                    sharePost(shareButton);
                });

                actions.appendChild(shareButton);
                content.appendChild(actions);

                
                const commentBox = document.createElement("div");
                commentBox.className = "comment-box";
                commentBox.style.display = "none";
                content.appendChild(commentBox);


                card.appendChild(content);
                publicGallery.appendChild(card);

                loadCommentsForArtwork(artworkId, commentBox);
            });
            const params = new URLSearchParams(
                window.location.search
            );

            const requestedArtworkId =
                params.get("artworkId");

            if (requestedArtworkId) {
                const targetCard = Array.from(
                    publicGallery.querySelectorAll(
                        "[data-artwork-id]"
                    )
                ).find(function(card) {
                    return card.dataset.artworkId ===
                        requestedArtworkId;
                });

                if (targetCard) {
                    targetCard.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                    targetCard.style.outline =
                        "3px solid #e6a23c";

                    targetCard.style.outlineOffset = "5px";
                }
            }
            console.log(
                "Real-time gallery updated:",
                allPhotos.length,
                "items"
            );
        }

        const unsubscribeArtworks = onSnapshot(
            collection(firebaseDB, "artworks"),
            function(snapshot) {
                artworksData = [];

                snapshot.forEach(function(docSnapshot) {
                    artworksData.push({
                        id: docSnapshot.id,
                        data: docSnapshot.data()
                    });
                });

                artworksReady = true;
                renderGallery();
            },
            function(error) {
                console.error("Artworks listener error:", error);
            }
        );

        const unsubscribePhotos = onSnapshot(
            collection(firebaseDB, "photos"),
            function(snapshot) {
                photosData = [];

                snapshot.forEach(function(docSnapshot) {
                    photosData.push({
                        id: "photo_" + docSnapshot.id,
                        data: docSnapshot.data()
                    });
                });

                photosReady = true;
                renderGallery();
            },
            function(error) {
                console.error("Photos listener error:", error);
            }
        );

        publicGalleryUnsubscribers.push(
            unsubscribeArtworks,
            unsubscribePhotos
        );

    } catch (error) {
        console.error("Real-time gallery error:", error);

        publicGallery.innerHTML =
            "<p>Gallery load nahi ho paayi. Console mein error dekhein.</p>";
    }
}



/* =========================
   LIKE BUTTON
========================= */
async function likePost(button) {
    const card = button.closest(".gallery-card");

    if (!card) return;

    const storedId = card.dataset.artworkId;

    if (!storedId) {
        alert("Artwork ID nahi mila.");
        return;
    }

    const likeKey = "liked_artwork_" + storedId;

    if (localStorage.getItem(likeKey) === "true") {
        alert("Already Liked.");
        return;
    }

    let visitorId = localStorage.getItem("artwithshailesh_visitor_id");

    if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("artwithshailesh_visitor_id", visitorId);
    }

    const buttonText = button.innerHTML;
    button.disabled = true;

    try {
        const response = await fetch(
            "https://egjllkvnvezvnnkscxbm.supabase.co/functions/v1/public-likes",
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer sb_publishable_2s_-otBOO6EzWJvMneNhPQ_QaEuAD-H",
                    "apikey": "sb_publishable_2s_-otBOO6EzWJvMneNhPQ_QaEuAD-H",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    artworkId: storedId,
                    visitorId: visitorId
                })
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || "Like save failed");
        }

        const countSpan = button.querySelector("span");

        if (countSpan) {
            countSpan.textContent = result.likeCount;
        }

        button.innerHTML =
            "❤️ Liked <span>" + result.likeCount + "</span>";

        localStorage.setItem(likeKey, "true");
        console.log("Like saved successfully.");

    } catch (error) {
        console.error("Like save error:", error);
        button.innerHTML = buttonText;
        alert("Like save nahi ho paya. Dobara try karein.");
    } finally {
        button.disabled = false;
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


    
    const name = prompt("Apna naam likhiye:");

    if (name === null || name.trim() === "") {
        return;
    }

    const comment = prompt("Apna comment likhiye:");

    if (comment === null || comment.trim() === "") {
        return;
    }



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

        const isPhoto = artworkId.startsWith("photo_");

        const collectionName = isPhoto ? "photos" : "artworks";

        const documentId = isPhoto
            ? artworkId.substring(6)
            : artworkId;

        await addDocFunction(
            collectionFunction(
                firebaseDB,
                collectionName,
                documentId,
                "comments"
            ),

            
            {
                name: name.trim(),

                text: comment.trim(),

                createdAt: serverTimestampFunction()
            }


        );


        /* =========================
           SHOW COMMENT ON PAGE
        ========================= */

        
        try {
            await addDocFunction(
                collectionFunction(firebaseDB, "adminNotifications"),
                {
                    artworkId: artworkId,
                    comment: comment.trim(),
                    read: false,
                    createdAt: serverTimestampFunction()
                }
            );
        } catch (notificationError) {
            console.error(
                "Comment notification save error:",
                notificationError
            );
        }

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
   REAL-TIME COMMENTS
========================= */

async function loadCommentsForArtwork(
    artworkId,
    commentBox
) {
    if (!artworkId || !commentBox) {
        return;
    }

    try {
        const firestoreModule = await import(
            "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
        );

        const collectionName = artworkId.startsWith("photo_")
            ? "photos"
            : "artworks";

        const documentId = artworkId.startsWith("photo_")
            ? artworkId.substring(6)
            : artworkId;

        firestoreModule.onSnapshot(
            firestoreModule.collection(
                firebaseDB,
                collectionName,
                documentId,
                "comments"
            ),
            function(commentSnapshot) {
                const comments = [];

                commentSnapshot.forEach(function(commentDocument) {
                    const commentData = commentDocument.data();

                    comments.push({
                        id: commentDocument.id,
                        name: commentData.name || "Visitor",
                        text: commentData.text || "",
                        createdAt: commentData.createdAt
                    });
                });

                comments.sort(function(a, b) {
                    const timeA = a.createdAt &&
                        typeof a.createdAt.toMillis === "function"
                        ? a.createdAt.toMillis()
                        : 0;

                    const timeB = b.createdAt &&
                        typeof b.createdAt.toMillis === "function"
                        ? b.createdAt.toMillis()
                        : 0;

                    return timeB - timeA;
                });

                const initialCount = 5;

                if (commentBox._showAllComments === undefined) {
                    commentBox._showAllComments = false;
                }

                function renderComments() {
                    commentBox.innerHTML = "";

                    const visibleComments =
                        commentBox._showAllComments
                            ? comments
                            : comments.slice(0, initialCount);

                    visibleComments.forEach(function(comment) {
                        const commentItem =
                            document.createElement("div");

                        commentItem.className = "comment-item";

                        const commentName =
                            document.createElement("strong");

                        commentName.className = "comment-author";
                        commentName.textContent = comment.name;

                        const commentText =
                            document.createElement("div");

                        commentText.textContent = comment.text;

                        commentItem.appendChild(commentName);
                        commentItem.appendChild(commentText);
                        if (
                            firebaseAuth &&
                            firebaseAuth.currentUser &&
                            isShaileshAdmin(
                                firebaseAuth.currentUser
                            )
                        ) {

                            const deleteCommentButton =
                                document.createElement("button");

                            deleteCommentButton.type = "button";
                            deleteCommentButton.textContent =
                                "🗑️ Delete";

                            deleteCommentButton.className =
                                "delete-comment-btn";

                            deleteCommentButton.addEventListener(
                                "click",
                                async function() {

                                    const confirmDelete = confirm(
                                        "Do you want to delete comment?"
                                    );

                                    if (!confirmDelete) {
                                        return;
                                    }

                                    try {

                                        await firestoreDeleteDoc(
                                            firestoreDoc(
                                                firebaseDB,
                                                collectionName,
                                                documentId,
                                                "comments",
                                                comment.id
                                            )
                                        );

                                        alert(
                                            "Comment deleted !"
                                        );

                                    } catch (error) {

                                        console.error(
                                            "Comment delete error:",
                                            error
                                        );

                                        alert(
                                            "Comment delete nahi hua. Firebase Rules check karein."
                                        );

                                    }

                                }
                            );

                            commentItem.appendChild(
                                deleteCommentButton
                            );

                        }
                        const replyButton =
                            document.createElement("button");

                        replyButton.type = "button";
                        replyButton.textContent = "↩️ Reply";
                        replyButton.className = "reply-comment-btn";

                        replyButton.addEventListener(
                            "click",
                            async function() {
                                const replyName = prompt(
                                    "Apna naam likhiye:"
                                );

                                if (!replyName || !replyName.trim()) {
                                    return;
                                }

                                const replyText = prompt(
                                    "Apna reply likhiye:"
                                );

                                if (!replyText || !replyText.trim()) {
                                    return;
                                }

                                try {
                                    await firestoreModule.addDoc(
                                        firestoreModule.collection(
                                            firebaseDB,
                                            collectionName,
                                            documentId,
                                            "comments",
                                            comment.id,
                                            "replies"
                                        ),
                                        {
                                            name: replyName.trim(),
                                            text: replyText.trim(),
                                            createdAt:
                                                firestoreModule.serverTimestamp()
                                        }
                                    );

                                    alert("Reply save ho gaya!");
                                } catch (error) {
                                    console.error(
                                        "Reply save error:",
                                        error
                                    );

                                    alert(
                                        "Reply save nahi hua. Firebase Rules check karein."
                                    );
                                }
                            }
                        );

                        commentItem.appendChild(replyButton);

                        const repliesContainer =
                            document.createElement("div");

                        repliesContainer.className = "comment-replies";
                        repliesContainer.style.marginLeft = "18px";
                        repliesContainer.style.marginTop = "8px";

                        commentItem.appendChild(repliesContainer);

                        firestoreModule.onSnapshot(
                            firestoreModule.collection(
                                firebaseDB,
                                collectionName,
                                documentId,
                                "comments",
                                comment.id,
                                "replies"
                            ),
                            function(replySnapshot) {
                                repliesContainer.innerHTML = "";

                                replySnapshot.forEach(
                                    function(replyDocument) {
                                        const replyData =
                                            replyDocument.data();

                                        const replyItem =
                                            document.createElement("div");

                                        replyItem.style.marginTop = "8px";
                                        replyItem.style.padding = "8px";
                                        replyItem.style.borderLeft =
                                            "2px solid #c9a86a";

                                        const replyAuthor =
                                            document.createElement("strong");

                                        replyAuthor.textContent =
                                            (replyData.name || "Visitor") +
                                            ": ";

                                        const replyContent =
                                            document.createElement("span");

                                        replyContent.textContent =
                                            replyData.text || "";

                                        replyItem.appendChild(replyAuthor);
                                        replyItem.appendChild(replyContent);
                                    if (
                                        firebaseAuth &&
                                        firebaseAuth.currentUser &&
                                        isShaileshAdmin(
                                            firebaseAuth.currentUser
                                        )
                                    ) {

                                        const deleteReplyButton =
                                            document.createElement("button");

                                        deleteReplyButton.type = "button";
                                        deleteReplyButton.textContent =
                                            "🗑️ Delete";

                                        deleteReplyButton.className =
                                            "delete-reply-btn";

                                        deleteReplyButton.addEventListener(
                                            "click",
                                            async function() {

                                                const confirmDelete = confirm(
                                                    "Do you want to delete reply?"
                                                );

                                                if (!confirmDelete) {
                                                    return;
                                                }

                                                try {

                                                    await firestoreDeleteDoc(
                                                        firestoreDoc(
                                                            firebaseDB,
                                                            collectionName,
                                                            documentId,
                                                            "comments",
                                                            comment.id,
                                                            "replies",
                                                            replyDocument.id
                                                        )
                                                    );

                                                    alert(
                                                        "Reply deleted!"
                                                    );

                                                } catch (error) {

                                                    console.error(
                                                        "Reply delete error:",
                                                        error
                                                    );

                                                    alert(
                                                        "Reply delete nahi hua. Firebase Rules check karein."
                                                    );

                                                }

                                            }
                                        );

                                        replyItem.appendChild(
                                            deleteReplyButton
                                        );

                                    }
                                        repliesContainer.appendChild(replyItem);


                                    }
                                );
                            },
                            function(error) {
                                console.error(
                                    "Replies load error:",
                                    error
                                );
                            }
                        );

                        commentBox.appendChild(commentItem);
                    });

                    if (comments.length > initialCount) {
                        const toggleButton =
                            document.createElement("button");

                        toggleButton.type = "button";
                        toggleButton.className =
                            "view-all-comments-btn";

                        toggleButton.textContent =
                            commentBox._showAllComments
                                ? "Show less"
                                : "View all comments (" +
                                  comments.length + ")";

                        toggleButton.addEventListener(
                            "click",
                            function() {
                                commentBox._showAllComments =
                                    !commentBox._showAllComments;

                                renderComments();
                            }
                        );

                        commentBox.appendChild(toggleButton);
                    }

                    commentBox.style.display =
                        comments.length > 0 ? "block" : "none";
                    commentBox._renderComments = renderComments;                       
                }

                renderComments();
            },
            function(error) {
                console.error(
                    "Real-time comments error:",
                    error
                );
            }
        );
    } catch (error) {
        console.error(
            "Comments listener setup error:",
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


/* =================================
   AUTOMATIC YOUTUBE VIDEOS
================================= */


async function loadYouTubeVideos(channelUrl) {
    const container = document.getElementById("youtubeVideos");

    if (!container) return;

    container.textContent = "YouTube videos loading...";

    try {

        const videosUrl = new URL(
            "https://egjllkvnvezvnnkscxbm.supabase.co/functions/v1/youtube-videos"
        );

        videosUrl.searchParams.set(
            "channelUrl",
            channelUrl
        );

        const response = await fetch(
            videosUrl.toString()
        );


        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || `Request failed: ${response.status}`
            );
        }

        const videos = data.videos || [];
        container.replaceChildren();

        if (videos.length === 0) {
            container.textContent =
                "Abhi koi video nahi mili.";
            return;
        }

                videos.forEach(function (video) {
            const videoId = String(video.videoId || "").trim();

            if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                return;
            }

            const card = document.createElement("div");
            card.className = "youtube-video-card";

            // Video thumbnail
            const thumbnail = document.createElement("img");
            thumbnail.src =
                "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";
            thumbnail.alt = video.title || "YouTube video thumbnail";
            thumbnail.loading = "lazy";
            thumbnail.style.width = "100%";
            thumbnail.style.display = "block";
            thumbnail.style.borderRadius = "10px";

            // Video title
            const heading = document.createElement("h3");
            heading.textContent = video.title || "YouTube video";

            // Watch on YouTube button
            const watchButton = document.createElement("a");
            watchButton.href =
                "https://www.youtube.com/watch?v=" + videoId;
            watchButton.textContent = "▶ Watch On YouTube ";
            watchButton.target = "_blank";
            watchButton.rel = "noopener noreferrer";
            watchButton.style.display = "inline-block";
            watchButton.style.margin = "12px 0";
            watchButton.style.padding = "10px 16px";
            watchButton.style.backgroundColor = "#ff0000";
            watchButton.style.color = "#ffffff";
            watchButton.style.textDecoration = "none";
            watchButton.style.borderRadius = "6px";

            card.appendChild(thumbnail);
            card.appendChild(heading);
            card.appendChild(watchButton);

            container.appendChild(card);
        });
    } catch (error) {
        console.error("YouTube videos error:", error);

        container.textContent =
            "Videos load nahi ho paaye. Console mein error dekhein.";
    }
}

/* =========================
   PUBLIC BACKGROUND PHOTO
========================= */

async function loadPublicBackgroundPhoto() {

    try {

        const firestoreModule = await import(
            "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
        );

        const backgroundSettingsRef =
            firestoreModule.doc(
                firebaseDB,
                "settings",
                "background"
            );

        firestoreModule.onSnapshot(
            backgroundSettingsRef,
            function (backgroundSnapshot) {

                if (!backgroundSnapshot.exists()) {
                    return;
                }

                const backgroundData =
                    backgroundSnapshot.data();

                if (!backgroundData.imageUrl) {
                    return;
                }

                const homeSection =
                    document.getElementById("home");
                    homeSection.style.backgroundImage = "none";
                if (!homeSection) {
                    return;
                }

                const backgroundImageUrl =
                    backgroundData.imageUrl;

                const image = new Image();

                image.onload = function () {

                    homeSection.style.backgroundImage =
                        "linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(" +
                        JSON.stringify(backgroundImageUrl) +
                        ")";

                    homeSection.style.backgroundSize =
                        "cover";

                    homeSection.style.backgroundPosition =
                        "center";

                    homeSection.style.backgroundRepeat =
                        "no-repeat";

                    console.log(
                        "Public background photo applied successfully."
                    );

                };

                image.onerror = function () {

                    console.error(
                        "Background image URL could not load."
                    );

                };

                image.src = backgroundImageUrl;

            },
            function (error) {

                console.error(
                    "Background photo loading error:",
                    error
                );

            }
        );

    } catch (error) {

        console.error(
            "Background photo setup error:",
            error
        );

    }

}


