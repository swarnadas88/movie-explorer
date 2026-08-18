from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2

from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from werkzeug.security import check_password_hash


app = Flask(__name__)
CORS(app)


# =========================================================
# JWT CONFIGURATION
# =========================================================

app.config["JWT_SECRET_KEY"] = "movie-explorer-secret-key-2026-secure"

jwt = JWTManager(app)


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_connection():

    return psycopg2.connect(
        host="localhost",
        database="movie_explorer",
        user="postgres",
        password="Sonu0803",
        port="5433"
    )


# =========================================================
# CHECK USER ROLE
# =========================================================

def user_has_role(user_id, role_name):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT 1
        FROM user_roles ur
        JOIN roles r
            ON r.id = ur.role_id
        WHERE ur.user_id = %s
        AND r.role_name = %s
    """, (user_id, role_name))

    result = cursor.fetchone()

    cursor.close()
    connection.close()

    return result is not None


# =========================================================
# GET ALL MOVIES
# =========================================================

@app.route("/api/movies")
def get_movies():

    genre = request.args.get("genre")

    connection = get_connection()
    cursor = connection.cursor()

    if genre:

        cursor.execute("""
            SELECT id, title, genre, year, rating
            FROM movies
            WHERE LOWER(genre) = LOWER(%s)
        """, (genre,))

    else:

        cursor.execute("""
            SELECT id, title, genre, year, rating
            FROM movies
        """)

    rows = cursor.fetchall()

    movies = []

    for row in rows:

        movie = {
            "id": row[0],
            "title": row[1],
            "genre": row[2],
            "year": row[3],
            "rating": float(row[4])
        }

        movies.append(movie)

    cursor.close()
    connection.close()

    return jsonify(movies)


# =========================================================
# ADD MOVIE
# =========================================================

@app.route("/api/movies", methods=["POST"])
@jwt_required()
def add_movie():

    # Get logged-in user's ID from JWT
    user_id = get_jwt_identity()

    print("Logged in user ID:", user_id, flush=True)

    # Check INSERT permission
    if not user_has_role(user_id, "INSERT"):

        return jsonify({
            "message": "Access denied. INSERT role required."
        }), 403

    data = request.get_json()

    title = data.get("title")
    genre = data.get("genre")
    year = data.get("year")
    rating = data.get("rating")

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO movies (title, genre, year, rating)
        VALUES (%s, %s, %s, %s)
        RETURNING id;
    """, (title, genre, year, rating))

    movie_id = cursor.fetchone()[0]

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Movie added successfully",
        "id": movie_id
    }), 201


# =========================================================
# UPDATE MOVIE
# =========================================================

@app.route("/api/movies/<int:movie_id>", methods=["PUT"])
@jwt_required()
def update_movie(movie_id):

    # Get logged-in user's ID from JWT
    user_id = get_jwt_identity()

    print("Logged in user ID:", user_id, flush=True)

    # Check UPDATE permission
    if not user_has_role(user_id, "UPDATE"):

        return jsonify({
            "message": "Access denied. UPDATE role required."
        }), 403

    data = request.get_json()

    title = data.get("title")
    genre = data.get("genre")
    year = data.get("year")
    rating = data.get("rating")

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE movies
        SET title = %s,
            genre = %s,
            year = %s,
            rating = %s
        WHERE id = %s
    """, (title, genre, year, rating, movie_id))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Movie updated successfully"
    })


# =========================================================
# DELETE MOVIE
# =========================================================

@app.route("/api/movies/<int:movie_id>", methods=["DELETE"])
@jwt_required()
def delete_movie(movie_id):

    # Get logged-in user's ID from JWT
    user_id = get_jwt_identity()

    print("Logged in user ID:", user_id, flush=True)

    # Check DELETE permission
    if not user_has_role(user_id, "DELETE"):

        return jsonify({
            "message": "Access denied. DELETE role required."
        }), 403

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM movies
        WHERE id = %s
    """, (movie_id,))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Movie deleted successfully"
    })


# =========================================================
# GET USER ROLES
# =========================================================

@app.route("/api/users/roles", methods=["GET"])
@jwt_required()
def get_user_roles():

    # Get logged-in user's ID from JWT
    user_id = get_jwt_identity()

    print("================================", flush=True)
    print("GET USER ROLES API WAS CALLED", flush=True)
    print("JWT USER ID:", user_id, flush=True)
    print("================================", flush=True)

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT r.id, r.role_name
        FROM roles r
        JOIN user_roles ur
            ON r.id = ur.role_id
        WHERE ur.user_id = %s
        ORDER BY r.id
    """, (user_id,))

    roles = cursor.fetchall()

    cursor.close()
    connection.close()

    result = []

    for role in roles:

        result.append({
            "id": role[0],
            "role_name": role[1]
        })

    return jsonify(result)


# =========================================================
# ASSIGN ROLE TO LOGGED-IN USER
# =========================================================

@app.route("/api/users/roles", methods=["POST"])
@jwt_required()
def assign_role():

    # Get logged-in user's ID from JWT
    user_id = get_jwt_identity()

    print("================================", flush=True)
    print("ASSIGN ROLE API WAS CALLED", flush=True)
    print("JWT USER ID:", user_id, flush=True)
    print("================================", flush=True)

    data = request.get_json()

    role_id = data.get("role_id")

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO user_roles (user_id, role_id)
        VALUES (%s, %s)
        ON CONFLICT (user_id, role_id)
        DO NOTHING
    """, (user_id, role_id))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Role assigned successfully"
    }), 201


# =========================================================
# REMOVE ROLE FROM LOGGED-IN USER
# =========================================================

@app.route("/api/users/roles/<int:role_id>", methods=["DELETE"])
@jwt_required()
def remove_user_role(role_id):

    # Get logged-in user's ID from JWT
    user_id = get_jwt_identity()

    print("================================", flush=True)
    print("REMOVE ROLE API WAS CALLED", flush=True)
    print("JWT USER ID:", user_id, flush=True)
    print("ROLE ID TO REMOVE:", role_id, flush=True)
    print("================================", flush=True)

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM user_roles
        WHERE user_id = %s
        AND role_id = %s
    """, (user_id, role_id))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Role removed successfully"
    })


# =========================================================
# LOGIN
# =========================================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id, username, password_hash
        FROM users
        WHERE username = %s
    """, (username,))

    user = cursor.fetchone()

    cursor.close()
    connection.close()

    # User does not exist
    if not user:

        return jsonify({
            "message": "Invalid username or password"
        }), 401

    user_id = user[0]

    stored_password_hash = user[2]

    # Check password
    if not check_password_hash(
        stored_password_hash,
        password
    ):

        return jsonify({
            "message": "Invalid username or password"
        }), 401

    # Create JWT token
    access_token = create_access_token(
        identity=str(user_id)
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token
    }), 200


# =========================================================
# START FLASK
# =========================================================

if __name__ == "__main__":

    app.run(debug=False)