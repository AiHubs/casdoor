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

package idp

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"regexp"

	"golang.org/x/oauth2"
)

type QqIdProvider struct {
	Client       *http.Client
	Config       *oauth2.Config
	ClientId     string
	ClientSecret string
	RedirectUrl  string
}

func NewQqIdProvider(clientId string, clientSecret string, redirectUrl string) *QqIdProvider {
	idp := &QqIdProvider{
		ClientId:     clientId,
		ClientSecret: clientSecret,
		RedirectUrl:  redirectUrl,
	}

	config := idp.getConfig()
	config.ClientID = clientId
	config.ClientSecret = clientSecret
	config.RedirectURL = redirectUrl
	idp.Config = config

	return idp
}

func (idp *QqIdProvider) SetHttpClient(client *http.Client) {
	idp.Client = client
}

func (idp *QqIdProvider) getConfig() *oauth2.Config {
	var endpoint = oauth2.Endpoint{
		TokenURL: "https://graph.qq.com/oauth2.0/token",
	}

	var config = &oauth2.Config{
		Scopes:   []string{"profile", "email"},
		Endpoint: endpoint,
	}

	return config
}

func (idp *QqIdProvider) GetToken(code string) (*oauth2.Token, error) {
	params := url.Values{}
	params.Add("grant_type", "authorization_code")
	params.Add("client_id", idp.ClientId)
	params.Add("client_secret", idp.ClientSecret)
	params.Add("code", code)
	params.Add("redirect_uri", idp.RedirectUrl)

	getAccessTokenUrl := fmt.Sprintf("https://graph.qq.com/oauth2.0/token?%s", params.Encode())
	tokenResponse, err := idp.Client.Get(getAccessTokenUrl)
	if err != nil {
		return nil, err
	}

	defer tokenResponse.Body.Close()
	tokenContent, err := ioutil.ReadAll(tokenResponse.Body)

	tokenReg := regexp.MustCompile("token=(.*?)&")
	tokenRegRes := tokenReg.FindAllStringSubmatch(string(tokenContent), -1)
	tokenStr := tokenRegRes[0][1]
	token := &oauth2.Token{
		AccessToken: tokenStr,
		TokenType:   "Bearer",
	}
	return token, nil
}

func (idp *QqIdProvider) GetUserInfo(token *oauth2.Token) (*UserInfo, error) {
	userInfo := &UserInfo{}

	getOpenIdUrl := fmt.Sprintf("https://graph.qq.com/oauth2.0/me?access_token=%s", token.AccessToken)
	openIdResponse, err := idp.Client.Get(getOpenIdUrl)
	if err != nil {
		return nil, err
	}

	defer openIdResponse.Body.Close()
	openIdContent, err := ioutil.ReadAll(openIdResponse.Body)

	openIdReg := regexp.MustCompile("\"openid\":\"(.*?)\"}")
	openIdRegRes := openIdReg.FindAllStringSubmatch(string(openIdContent), -1)
	openId := openIdRegRes[0][1]
	if openId == "" {
		return nil, errors.New("openId is empty")
	}

	getUserInfoUrl := fmt.Sprintf("https://graph.qq.com/user/get_user_info?access_token=%s&oauth_consumer_key=%s&openid=%s", token.AccessToken, idp.ClientId, openId)
	getUserInfoResponse, err := idp.Client.Get(getUserInfoUrl)
	if err != nil {
		return nil, err
	}

	type response struct {
		Ret       int    `json:"ret"`
		Nickname  string `json:"nickname"`
		AvatarUrl string `json:"figureurl_qq_1"`
	}

	defer getUserInfoResponse.Body.Close()
	userInfoContent, err := ioutil.ReadAll(getUserInfoResponse.Body)
	var userResponse response
	err = json.Unmarshal(userInfoContent, &userResponse)
	if err != nil {
		return nil, err
	}
	if userResponse.Ret != 0 {
		return nil, errors.New(fmt.Sprintf("ret expected 0, got %d", userResponse.Ret))
	}

	userInfo.Username = userResponse.Nickname
	userInfo.AvatarUrl = userResponse.AvatarUrl
	return userInfo, nil
}
