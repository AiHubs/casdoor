// Copyright 2022 The Casdoor Authors. All Rights Reserved.
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

package object

import (
	"github.com/beego/beego"
	"github.com/casdoor/casdoor/util"
	"github.com/xorm-io/core"
)

var (
	CasdoorApplication  = "app-built-in"
	CasdoorOrganization = "built-in"
)

type Session struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	Application string `xorm:"varchar(100) notnull pk" json:"application"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	SessionId []string `json:"sessionId"`
}

func GetSessions(owner string) []*Session {
	sessions := []*Session{}
	var err error
	if owner != "" {
		err = adapter.Engine.Desc("created_time").Where("owner = ?", owner).Find(&sessions)
	} else {
		err = adapter.Engine.Desc("created_time").Find(&sessions)
	}
	if err != nil {
		panic(err)
	}

	return sessions
}

func GetPaginationSessions(owner string, offset, limit int, field, value, sortField, sortOrder string) []*Session {
	sessions := []*Session{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&sessions)
	if err != nil {
		panic(err)
	}

	return sessions
}

func GetSessionCount(owner, field, value string) int {
	session := GetSession(owner, -1, -1, field, value, "", "")
	count, err := session.Count(&Session{})
	if err != nil {
		panic(err)
	}

	return int(count)
}

func GetSingleSession(id string) *Session {
	owner, name, application := util.GetOwnerAndNameAndOtherFromId(id)
	session := &Session{Owner: owner, Name: name, Application: application}
	_, err := adapter.Engine.ID(core.PK{owner, name, application}).Get(session)
	if err != nil {
		panic(err)
	}

	return session
}

func UpdateSession(id string, session *Session) bool {
	owner, name, application := util.GetOwnerAndNameAndOtherFromId(id)

	_, err := adapter.Engine.ID(core.PK{owner, name, application}).Get(session)
	if err != nil {
		return false
	}

	affected, err := adapter.Engine.ID(core.PK{owner, name, application}).Update(session)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func AddSession(session *Session) bool {
	owner, name, application := session.Owner, session.Name, session.Application

	dbSession := &Session{Owner: owner, Name: name, Application: application}
	get, err := adapter.Engine.ID(core.PK{owner, name, application}).Get(dbSession)
	if err != nil {
		return false
	}

	var affected int64
	var dbErr error
	if !get {
		session.CreatedTime = util.GetCurrentTime()
		affected, dbErr = adapter.Engine.Insert(session)
	} else {
		m := make(map[string]struct{})
		for _, v := range dbSession.SessionId {
			m[v] = struct{}{}
		}
		for _, v := range session.SessionId {
			if _, exists := m[v]; !exists {
				dbSession.SessionId = append(dbSession.SessionId, v)
			}
		}
		affected, dbErr = adapter.Engine.ID(core.PK{owner, name, application}).Update(dbSession)
	}
	if dbErr != nil {
		panic(dbErr)
	}
	return affected != 0
}

func DeleteSession(id string) bool {
	owner, name, application := util.GetOwnerAndNameAndOtherFromId(id)

	session := &Session{Owner: owner, Name: name, Application: application}
	_, err := adapter.Engine.ID(core.PK{owner, name, application}).Get(session)
	if err != nil {
		return false
	}

	if owner == CasdoorOrganization && application == CasdoorApplication {
		DeleteBeegoSession(session.SessionId)
	}

	affected, err := adapter.Engine.ID(core.PK{owner, name, application}).Delete(session)
	return affected != 0
}

func DeleteSessionId(id string, sessionId string) bool {
	owner, name, application := util.GetOwnerAndNameAndOtherFromId(id)

	session := &Session{Owner: owner, Name: name, Application: application}
	_, err := adapter.Engine.ID(core.PK{owner, name, application}).Get(session)
	if err != nil {
		return false
	}

	if owner == CasdoorOrganization && application == CasdoorApplication {
		DeleteBeegoSession([]string{sessionId})
	}
	session.SessionId = util.DeleteVal(session.SessionId, sessionId)

	if len(session.SessionId) < 1 {
		affected, _ := adapter.Engine.ID(core.PK{owner, name, application}).Delete(session)
		return affected != 0
	} else {
		affected, _ := adapter.Engine.ID(core.PK{owner, name, application}).Update(session)
		return affected != 0
	}
}

func DeleteBeegoSession(sessionIds []string) {
	for _, sessionId := range sessionIds {
		err := beego.GlobalSessions.GetProvider().SessionDestroy(sessionId)
		if err != nil {
			return
		}
	}
}

func IsSessionDuplicated(id string, sessionId string) bool {
	owner, name, application := util.GetOwnerAndNameAndOtherFromId(id)
	session := &Session{Owner: owner, Name: name, Application: application}
	get, _ := adapter.Engine.ID(core.PK{owner, name, application}).Get(session)
	if !get {
		return false
	} else {
		if len(session.SessionId) > 1 {
			return true
		} else if len(session.SessionId) < 1 {
			return false
		} else {
			return session.SessionId[0] != sessionId
		}
	}
}
