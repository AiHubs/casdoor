// Copyright 2021 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package routers

import (
	"fmt"
	"strings"

	"github.com/astaxie/beego/context"
	"github.com/casbin/casdoor/object"
	"github.com/casbin/casdoor/util"
)

func AutoSigninFilter(ctx *context.Context) {
	//if getSessionUser(ctx) != "" {
	//	return
	//}

	// "/page?access_token=123"
	accessToken := ctx.Input.Query("accessToken")
	if accessToken != "" {
		claims, err := object.ParseJwtToken(accessToken)
		if err != nil {
			responseError(ctx, "invalid JWT token")
			return
		}

		userId := fmt.Sprintf("%s/%s", claims.User.Owner, claims.User.Name)
		setSessionUser(ctx, userId)
		return
	}

	// "/page?clientId=123&clientSecret=456"
	userId := getUsernameByClientIdSecret(ctx)
	if userId != "" {
		setSessionUser(ctx, userId)
		return
	}

	// "/page?username=abc&password=123"
	userId = ctx.Input.Query("username")
	password := ctx.Input.Query("password")
	if userId != "" && password != "" {
		owner, name := util.GetOwnerAndNameFromId(userId)
		_, msg := object.CheckUserPassword(owner, name, password)
		if msg != "" {
			responseError(ctx, msg)
			return
		}

		setSessionUser(ctx, userId)
		return
	}

	//Bearer token
	//headers: {"Authorization":accessToken}
	BearerToken := strings.Split(ctx.Request.Header.Get("Authorization"), " ")
	if len(BearerToken) > 1 {
		claims, err := object.ParseJwtToken(BearerToken[1])
		if err == nil {
			setSessionUser(ctx, fmt.Sprintf("%v/%v", claims.Owner, claims.Name))
			setSeesionExpire(ctx, claims.ExpiresAt.Unix())
			return
		}
	}
}
