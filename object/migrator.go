// Copyright 2023 The Casdoor Authors. All Rights Reserved.
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

import "xorm.io/xorm/migrate"

type Migrator interface {
	IsMigrationNeeded(adapter *Adapter) bool
	DoMigration(adapter *Adapter) *migrate.Migration
}

func DoMigration(adapter *Adapter) {
	migrators := []Migrator{
		&Migrator_1_101_0_PR_1083{},
		&Migrator_1_235_0_PR_1530{},
		&Migrator_1_236_0_PR_1533{},
		// more migrators add here in chronological order...
	}

	migrations := []*migrate.Migration{}

	for _, migrator := range migrators {
		if migrator.IsMigrationNeeded(adapter) {
			migrations = append(migrations, migrator.DoMigration(adapter))
		}
	}

	m := migrate.New(adapter.Engine, migrate.DefaultOptions, migrations)
	m.Migrate()
}
