package handler

import (
	"github.com/casdoor/casdoor/internal/handler/login"
	"net/http"

	"github.com/casdoor/casdoor/internal/handler/application"

	"github.com/casdoor/casdoor/internal/handler/user"
	"github.com/casdoor/casdoor/internal/store"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var corsConfig = cors.Config{
	AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
	AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type"},
	ExposeHeaders:    []string{"Content-Length"},
	AllowCredentials: true,
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSNotSupportingCredentials
	AllowOrigins: []string{"http://localhost:3000"},
	MaxAge:       300,
}

func New(userStore *store.UserStore, applicationStore *store.ApplicationStore) http.Handler {
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(cors.New(corsConfig))

	//r.StaticFS("/", http.Dir("web/build/index.html"))

	apiGroup := r.Group("/api")
	userHandler := user.New(userStore)
	apiGroup.GET("/get-users", userHandler.GetUsers)
	apiGroup.GET("/get-user", userHandler.GetUser)
	apiGroup.POST("/update-user", userHandler.UpdateUser)
	apiGroup.POST("/add-user", userHandler.AddUser)
	apiGroup.POST("/delete-user", userHandler.DeleteUser)

	applicationHandler := application.New(applicationStore)
	apiGroup.GET("/applications", applicationHandler.List)
	apiGroup.GET("/applications/:id", applicationHandler.Get)
	apiGroup.POST("/applications", applicationHandler.Create)
	apiGroup.PATCH("/applications", applicationHandler.Update)

	loginHandler := login.New(userStore)
	apiGroup.GET("/login/github", gin.WrapF(loginHandler.LoginByGithub))

	return r
}
