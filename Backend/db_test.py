import psycopg2

connection = psycopg2.connect(
    host="localhost",
    database="movie_explorer",
    user="postgres",
    password="Sonu0803",
    port="5433"
)

print("Database connected successfully!")

connection.close()