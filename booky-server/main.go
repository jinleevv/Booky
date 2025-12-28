package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func setupRoutes(r *gin.Engine) {
	// API Group
	api := r.Group("/api")
	{
		// Users
		// api.POST("/users", handlers.RegisterUser) 
		
		// Teams Group
		teams := api.Group("/teams")
		{
			// teams.GET("/by-user", handlers.GetUserTeams)
			// teams.POST("/create", handlers.CreateTeam)
			// teams.PATCH("/", handlers.UpdateAppointment) // Matches app.use("/api/teams", updateAppointmentRoute)
		}
		
		// Polls Group
		polls := api.Group("/polls")
		{
			// polls.POST("/create", handlers.CreatePoll)
		}
	}
}

var mongoClient *mongo.Client
func main() {
	// load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	mongoUri := os.Getenv("MONGODB_URI")
	if mongoUri == "" {
		log.Fatal("MONGODB_URI is not set")
	}

	clientOptions := options.Client().ApplyURI(mongoUri)
	mongoClient, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// verify MongoDB connection
	err = mongoClient.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Could not connect to MongoDB:", err)
	}

	fmt.Println("Connected to MongoDB")

	router := gin.Default()

	// set up the router
	router.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			allowedOrigins := []string{
				"http://localhost:5173",
				"http://localhost:10000",
				"https://booky.im",
				"https://www.booky.im",
			}
			for _, allowed := range allowedOrigins {
				if origin == allowed {
					return true
				}
			}

			fmt.Printf("Blocked origin: %s\n", origin)
			return false
		},
		AllowMethods: []string{"GET", "POST", "PATCH", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		AllowCredentials: true,
	}))

	router.Use(func(c *gin.Context) {
		c.Header("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
		c.Next()
	})

	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	setupRoutes(router)

	router.Static("/assets", "../booky/dist/assets")
	router.StaticFile("/favicon.ico", "../booky/dist/favicon.ico")
	router.NoRoute(func(c *gin.Context) {
		c.File("../booky/dist/index.html")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	fmt.Printf("Server running on port %s\n", port)
	router.Run(":" + port)
}