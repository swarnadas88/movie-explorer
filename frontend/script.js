// =========================================================
// LOGIN
// =========================================================

document
    .getElementById("loginButton")
    .addEventListener(
        "click",
        function () {

            console.log("LOGIN BUTTON CLICKED");

            const username =
                document.getElementById(
                    "loginUsername"
                ).value;

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;

            console.log(
                "Username:",
                username
            );

            fetch(
                "http://127.0.0.1:5000/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            )

            .then(response => {

                console.log(
                    "Login response status:",
                    response.status
                );

                return response.json();

            })

            .then(data => {

                console.log(
                    "Login response:",
                    data
                );

                if (data.access_token) {

                    // Store JWT
                    localStorage.setItem(
                        "access_token",
                        data.access_token
                    );

                    document.getElementById(
                        "loginMessage"
                    ).textContent =
                        "Login successful!";

                    alert(
                        "Login successful!"
                    );

                    console.log(
                        "JWT stored successfully."
                    );

                    // Load movies
                    getMovies();

                    // Load logged-in user's roles
                    getUserRoles();

                }

                else {

                    document.getElementById(
                        "loginMessage"
                    ).textContent =
                        data.message ||
                        "Login failed.";

                }

            })

            .catch(error => {

                console.error(
                    "Login error:",
                    error
                );

            });

        }
    );


// =========================================================
// GLOBAL VARIABLES
// =========================================================

let allMovies = [];

let editingMovieId = null;


// =========================================================
// JWT HELPER
// =========================================================

function getAuthHeaders() {

    const token =
        localStorage.getItem(
            "access_token"
        );

    return {

        "Content-Type":
            "application/json",

        "Authorization":
            "Bearer " + token

    };

}


// =========================================================
// GET MOVIES
// =========================================================

function getMovies(genre = "") {

    let url =
        "http://127.0.0.1:5000/api/movies";

    if (genre) {

        url += `?genre=${genre}`;

    }

    const token =
        localStorage.getItem(
            "access_token"
        );


    if (!token) {

        console.log(
            "Please login to load movies."
        );

        return;

    }


    fetch(
        url,
        {
            headers:
                getAuthHeaders()
        }
    )

        .then(response => {

            console.log(
                "Get movies status:",
                response.status
            );


            return response.json()
                .then(data => {

                    return {

                        status:
                            response.status,

                        data: data

                    };

                });

        })

        .then(result => {

            console.log(
                "Get movies response:",
                result.data
            );


            if (
                result.status === 401
            ) {

                alert(
                    "Please login again."
                );

                localStorage.removeItem(
                    "access_token"
                );

                return;

            }


            if (
                result.status !== 200
            ) {

                console.error(
                    "Failed to get movies:",
                    result.data
                );

                return;

            }


            allMovies =
                result.data;

            displayMovies(
                allMovies
            );

        })

        .catch(error => {

            console.error(
                "Error:",
                error
            );

        });

}


// =========================================================
// DISPLAY MOVIES
// =========================================================

function displayMovies(movies) {

    const container =
        document.getElementById(
            "movie-container"
        );

    container.innerHTML = "";


    movies.forEach(movie => {

        const movieCard =
            document.createElement(
                "div"
            );

        movieCard.classList.add(
            "movie-card"
        );


        movieCard.innerHTML = `

            <h2>${movie.title}</h2>

            <p>🎭 Genre: ${movie.genre}</p>

            <p>📅 Year: ${movie.year}</p>

            <p>⭐ Rating: ${movie.rating}</p>

            <button onclick="editMovie(${movie.id})">
                Edit
            </button>

            <button onclick="deleteMovie(${movie.id})">
                Delete
            </button>

        `;


        container.appendChild(
            movieCard
        );

    });

}


// =========================================================
// SEARCH MOVIES
// =========================================================

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        function () {

            const searchText =
                this.value.toLowerCase();


            const filteredMovies =
                allMovies.filter(
                    movie =>
                        movie.title
                            .toLowerCase()
                            .includes(searchText)
                );


            displayMovies(
                filteredMovies
            );

        }
    );


// =========================================================
// GENRE FILTER
// =========================================================

document
    .getElementById("genreFilter")
    .addEventListener(
        "change",
        function () {

            const selectedGenre =
                this.value;


            getMovies(
                selectedGenre
            );

        }
    );


// =========================================================
// LOAD MOVIES WHEN PAGE OPENS
// =========================================================

getMovies();


// =========================================================
// ADD MOVIE
// =========================================================

document
    .getElementById("addMovieButton")
    .addEventListener(
        "click",
        function () {

            console.log(
                "ADD MOVIE BUTTON CLICKED"
            );


            const title =
                document.getElementById(
                    "title"
                ).value;


            const genre =
                document.getElementById(
                    "genre"
                ).value;


            const year =
                document.getElementById(
                    "year"
                ).value;


            const rating =
                document.getElementById(
                    "rating"
                ).value;


            const token =
                localStorage.getItem(
                    "access_token"
                );


            if (!token) {

                alert(
                    "Please login first."
                );

                return;

            }


            fetch(
                "http://127.0.0.1:5000/api/movies",
                {

                    method: "POST",

                    headers:
                        getAuthHeaders(),

                    body: JSON.stringify({

                        title: title,

                        genre: genre,

                        year: Number(year),

                        rating: Number(rating)

                    })

                }
            )

            .then(response => {

                console.log(
                    "Add movie response status:",
                    response.status
                );


                return response.json()
                    .then(data => {

                        return {

                            status:
                                response.status,

                            data: data

                        };

                    });

            })

            .then(result => {

                console.log(
                    "Add movie API response:",
                    result.data
                );


                if (
                    result.status === 403
                ) {

                    alert(
                        result.data.message
                    );

                    return;

                }


                if (
                    result.status === 401
                ) {

                    alert(
                        "Please login again."
                    );

                    return;

                }


                if (
                    result.status !== 201
                ) {

                    alert(
                        result.data.message ||
                        "Movie could not be added."
                    );

                    return;

                }


                alert(
                    "Movie added successfully!"
                );


                getMovies();

            })

            .catch(error => {

                console.error(
                    "POST ERROR:",
                    error
                );

            });

        }
    );


// =========================================================
// EDIT MOVIE
// =========================================================

function editMovie(movieId) {

    const movie =
        allMovies.find(
            movie =>
                movie.id === movieId
        );


    if (!movie) {

        console.log(
            "Movie not found"
        );

        return;

    }


    editingMovieId =
        movieId;


    document.getElementById(
        "title"
    ).value =
        movie.title;


    document.getElementById(
        "genre"
    ).value =
        movie.genre;


    document.getElementById(
        "year"
    ).value =
        movie.year;


    document.getElementById(
        "rating"
    ).value =
        movie.rating;


    document.getElementById(
        "formTitle"
    ).textContent =
        "Edit Movie";


    document.getElementById(
        "addMovieButton"
    ).style.display =
        "none";


    document.getElementById(
        "updateMovieButton"
    ).style.display =
        "inline-block";


    console.log(
        "Editing movie ID:",
        editingMovieId
    );

}


// =========================================================
// DELETE MOVIE
// =========================================================

function deleteMovie(movieId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this movie?"
        );


    if (!confirmDelete) {

        return;

    }


    const token =
        localStorage.getItem(
            "access_token"
        );


    if (!token) {

        alert(
            "Please login first."
        );

        return;

    }


    fetch(
        `http://127.0.0.1:5000/api/movies/${movieId}`,
        {

            method: "DELETE",

            headers:
                getAuthHeaders()

        }
    )

    .then(response => {

        console.log(
            "Delete status:",
            response.status
        );


        return response.json()
            .then(data => {

                return {

                    status:
                        response.status,

                    data: data

                };

            });

    })

    .then(result => {

        console.log(
            "Delete response:",
            result.data
        );


        if (
            result.status === 403
        ) {

            alert(
                result.data.message
            );

            return;

        }


        if (
            result.status === 401
        ) {

            alert(
                "Please login again."
            );

            return;

        }


        if (
            result.status !== 200
        ) {

            alert(
                result.data.message ||
                "Delete failed."
            );

            return;

        }


        alert(
            "Movie deleted successfully!"
        );


        getMovies();

    })

    .catch(error => {

        console.error(
            "Delete error:",
            error
        );

    });

}


// =========================================================
// UPDATE MOVIE
// =========================================================

document
    .getElementById("updateMovieButton")
    .addEventListener(
        "click",
        function () {

            if (
                editingMovieId === null
            ) {

                alert(
                    "No movie selected for editing."
                );

                return;

            }


            const title =
                document.getElementById(
                    "title"
                ).value;


            const genre =
                document.getElementById(
                    "genre"
                ).value;


            const year =
                document.getElementById(
                    "year"
                ).value;


            const rating =
                document.getElementById(
                    "rating"
                ).value;


            const token =
                localStorage.getItem(
                    "access_token"
                );


            if (!token) {

                alert(
                    "Please login first."
                );

                return;

            }


            fetch(
                `http://127.0.0.1:5000/api/movies/${editingMovieId}`,
                {

                    method: "PUT",

                    headers:
                        getAuthHeaders(),

                    body: JSON.stringify({

                        title: title,

                        genre: genre,

                        year: Number(year),

                        rating: Number(rating)

                    })

                }
            )

            .then(response => {

                console.log(
                    "Update status:",
                    response.status
                );


                return response.json()
                    .then(data => {

                        return {

                            status:
                                response.status,

                            data: data

                        };

                    });

            })

            .then(result => {

                console.log(
                    "Update response:",
                    result.data
                );


                if (
                    result.status === 403
                ) {

                    alert(
                        result.data.message
                    );

                    return;

                }


                if (
                    result.status === 401
                ) {

                    alert(
                        "Please login again."
                    );

                    return;

                }


                if (
                    result.status !== 200
                ) {

                    alert(
                        result.data.message ||
                        "Update failed."
                    );

                    return;

                }


                alert(
                    "Movie updated successfully!"
                );


                editingMovieId =
                    null;


                document.getElementById(
                    "formTitle"
                ).textContent =
                    "Add a Movie";


                document.getElementById(
                    "updateMovieButton"
                ).style.display =
                    "none";


                document.getElementById(
                    "addMovieButton"
                ).style.display =
                    "inline-block";


                document.getElementById(
                    "title"
                ).value = "";


                document.getElementById(
                    "genre"
                ).value = "";


                document.getElementById(
                    "year"
                ).value = "";


                document.getElementById(
                    "rating"
                ).value = "";


                getMovies();

            })

            .catch(error => {

                console.error(
                    "Update error:",
                    error
                );

            });

        }
    );


// =========================================================
// GET USER ROLES
// =========================================================

function getUserRoles() {

    console.log(
        "GET USER ROLES CALLED"
    );


    const token =
        localStorage.getItem(
            "access_token"
        );


    const rolesContainer =
        document.getElementById(
            "currentRoles"
        );


    const removeDropdown =
        document.getElementById(
            "removeRoleDropdown"
        );


    // No JWT
    if (!token) {

        console.log(
            "No JWT found."
        );


        rolesContainer.innerHTML =
            "<p>Please login to view roles.</p>";

        return;

    }


    // Show loading while API is running
    rolesContainer.innerHTML =
        "<p>Loading roles...</p>";


    // =====================================================
    // GET ROLES USING JWT
    // =====================================================

    fetch(
        "http://127.0.0.1:5000/api/users/roles",
        {

            method: "GET",

            headers:
                getAuthHeaders()

        }
    )

    .then(response => {

        console.log(
            "Get roles status:",
            response.status
        );


        return response.json()
            .then(data => {

                return {

                    status:
                        response.status,

                    data: data

                };

            });

    })

    .then(result => {

        console.log(
            "Get roles response:",
            result.data
        );


        // JWT invalid
        if (
            result.status === 401
        ) {

            console.log(
                "JWT missing or invalid."
            );


            rolesContainer.innerHTML =
                "<p>Please login again.</p>";


            localStorage.removeItem(
                "access_token"
            );


            return;

        }


        // Other API error
        if (
            result.status !== 200
        ) {

            console.error(
                "Unable to load roles:",
                result.data
            );


            rolesContainer.innerHTML =
                "<p>Unable to load roles.</p>";


            return;

        }


        const roles =
            result.data;


        console.log(
            "Logged-in user's roles:",
            roles
        );


        rolesContainer.innerHTML =
            "";


        removeDropdown.innerHTML =
            '<option value="">Select a role</option>';


        if (
            !Array.isArray(roles)
        ) {

            rolesContainer.innerHTML =
                "<p>Unable to load roles.</p>";

            return;

        }


        if (
            roles.length === 0
        ) {

            rolesContainer.textContent =
                "No roles assigned.";


            loadAvailableRoles();

            return;

        }


        roles.forEach(role => {

            // =================================================
            // ROLE NAME
            // =================================================

            const roleContainer =
                document.createElement(
                    "div"
                );


            roleContainer.classList.add(
                "role-row"
            );


            const roleName =
                document.createElement(
                    "span"
                );


            roleName.textContent =
                role.role_name;


            roleName.classList.add(
                "role-badge"
            );


            // =================================================
            // REMOVE BUTTON
            // =================================================

            const removeButton =
                document.createElement(
                    "button"
                );


            removeButton.textContent =
                "Remove";


            removeButton.classList.add(
                "remove-role-button"
            );


            removeButton.addEventListener(
                "click",
                function () {

                    const userSelect =
                        document.getElementById(
                            "userSelect"
                        );


                    const userId =
                        userSelect.value;


                    removeRole(
                        userId,
                        role.id
                    );

                }
            );


            roleContainer.appendChild(
                roleName
            );


            roleContainer.appendChild(
                removeButton
            );


            rolesContainer.appendChild(
                roleContainer
            );


            // =================================================
            // REMOVE ROLE DROPDOWN
            // =================================================

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                role.id;


            option.textContent =
                role.role_name;


            removeDropdown.appendChild(
                option
            );

        });


        // Refresh available roles
        loadAvailableRoles();

    })

    .catch(error => {

        console.error(
            "Error getting user roles:",
            error
        );


        rolesContainer.innerHTML =
            "<p>Unable to load roles.</p>";

    });

}


// =========================================================
// LOAD USER ROLES AFTER PAGE REFRESH
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "PAGE LOADED - CHECKING JWT"
        );


        const token =
            localStorage.getItem(
                "access_token"
            );


        if (token) {

            console.log(
                "JWT found after refresh."
            );


            getUserRoles();

        }

        else {

            console.log(
                "No JWT found after refresh."
            );

        }

    }
);


// =========================================================
// REMOVE ROLE
// =========================================================

function removeRole(
    userId,
    roleId
) {

    const confirmRemove =
        confirm(
            "Are you sure you want to remove this role?"
        );


    if (!confirmRemove) {

        return;

    }


    const token =
        localStorage.getItem(
            "access_token"
        );


    if (!token) {

        alert(
            "Please login first."
        );

        return;

    }


    // =====================================================
    // CHANGED:
    // OLD:
    // /api/users/${userId}/roles/${roleId}
    //
    // NEW:
    // /api/users/roles/${roleId}
    //
    // User ID now comes from JWT
    // =====================================================

    fetch(
        `http://127.0.0.1:5000/api/users/roles/${roleId}`,
        {

            method: "DELETE",

            headers:
                getAuthHeaders()

        }
    )

    .then(response => {

        console.log(
            "Remove role status:",
            response.status
        );


        return response.json()
            .then(data => {

                return {

                    status:
                        response.status,

                    data: data

                };

            });

    })

    .then(result => {

        console.log(
            "Remove role response:",
            result.data
        );


        if (
            result.status === 401
        ) {

            alert(
                "Please login again."
            );

            return;

        }


        if (
            result.status === 403
        ) {

            alert(
                result.data.message ||
                "You do not have permission to remove this role."
            );

            return;

        }


        if (
            result.status !== 200
        ) {

            alert(
                result.data.message ||
                "Role removal failed."
            );

            return;

        }


        alert(
            result.data.message ||
            "Role removed successfully!"
        );


        getUserRoles();

    })

    .catch(error => {

        console.error(
            "Remove role error:",
            error
        );

    });

}


// =========================================================
// ASSIGN ROLE
// =========================================================

document
    .getElementById("assignRoleButton")
    .addEventListener(
        "click",
        function () {

            const roleId =
                document.getElementById(
                    "roleDropdown"
                ).value;


            if (!roleId) {

                alert(
                    "Please select a role."
                );

                return;

            }


            const token =
                localStorage.getItem(
                    "access_token"
                );


            if (!token) {

                alert(
                    "Please login first."
                );

                return;

            }


            fetch(
                "http://127.0.0.1:5000/api/users/roles",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        role_id:
                            Number(roleId)

                    })

                }
            )

            .then(response => {

                console.log(
                    "Assign role status:",
                    response.status
                );


                return response.json();

            })

            .then(data => {

                console.log(
                    "Assign role response:",
                    data
                );


                document.getElementById(
                    "roleMessage"
                ).textContent =
                    data.message;


                getUserRoles();

            })

            .catch(error => {

                console.error(
                    "Assign role error:",
                    error
                );

            });

        }
    );


// =========================================================
// REMOVE ROLE FROM DROPDOWN
// =========================================================

document
    .getElementById("removeRoleButton")
    .addEventListener(
        "click",
        function () {

            const roleId =
                document.getElementById(
                    "removeRoleDropdown"
                ).value;


            if (!roleId) {

                alert(
                    "Please select a role."
                );

                return;

            }


            const token =
                localStorage.getItem(
                    "access_token"
                );


            if (!token) {

                alert(
                    "Please login first."
                );

                return;

            }


            // =================================================
            // CHANGED:
            // OLD:
            // /api/users/1/roles/${roleId}
            //
            // NEW:
            // /api/users/roles/${roleId}
            //
            // User ID now comes from JWT
            // =================================================

            fetch(
                `http://127.0.0.1:5000/api/users/roles/${roleId}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            )

            .then(response => {

                console.log(
                    "Remove role status:",
                    response.status
                );


                return response.json();

            })

            .then(data => {

                console.log(
                    "Remove role response:",
                    data
                );


                document.getElementById(
                    "removeRoleMessage"
                ).textContent =
                    data.message;


                getUserRoles();

            })

            .catch(error => {

                console.error(
                    "Remove role error:",
                    error
                );

            });

        }
    );


// =========================================================
// LOAD AVAILABLE ROLES
// =========================================================

function loadAvailableRoles() {

    const roleDropdown =
        document.getElementById(
            "roleDropdown"
        );


    const allRoles = [

        {
            id: 1,
            role_name: "INSERT"
        },

        {
            id: 2,
            role_name: "UPDATE"
        },

        {
            id: 3,
            role_name: "DELETE"
        }

    ];


    const token =
        localStorage.getItem(
            "access_token"
        );


    if (!token) {

        roleDropdown.innerHTML =
            '<option value="">Login first</option>';

        return;

    }


    // =====================================================
    // GET CURRENT ROLES USING JWT
    // =====================================================

    fetch(
        "http://127.0.0.1:5000/api/users/roles",
        {

            method: "GET",

            headers:
                getAuthHeaders()

        }
    )

    .then(response => {

        console.log(
            "Load available roles status:",
            response.status
        );


        return response.json()
            .then(data => {

                return {

                    status:
                        response.status,

                    data: data

                };

            });

    })

    .then(result => {

        if (
            result.status === 401
        ) {

            roleDropdown.innerHTML =
                '<option value="">Please login again</option>';

            return;

        }


        if (
            result.status !== 200
        ) {

            roleDropdown.innerHTML =
                '<option value="">Unable to load roles</option>';

            return;

        }


        const currentRoles =
            result.data;


        const assignedRoleIds =
            currentRoles.map(
                role =>
                    role.id
            );


        roleDropdown.innerHTML =
            '<option value="">Select a role</option>';


        allRoles.forEach(
            role => {

                if (
                    !assignedRoleIds.includes(
                        role.id
                    )
                ) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        role.id;


                    option.textContent =
                        role.role_name;


                    roleDropdown.appendChild(
                        option
                    );

                }

            }
        );


        if (
            roleDropdown.options.length === 1
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.disabled =
                true;


            option.textContent =
                "No roles available";


            roleDropdown.appendChild(
                option
            );

        }

    })

    .catch(error => {

        console.error(
            "Error loading available roles:",
            error
        );


        roleDropdown.innerHTML =
            '<option value="">Unable to load roles</option>';

    });

}