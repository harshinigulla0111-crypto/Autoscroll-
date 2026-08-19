package com.autoscroll.app.data.local

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
    entities = [ReadingSessionEntity::class, UserPreferenceEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AutoScrollDatabase : RoomDatabase() {
    abstract fun readingSessionDao(): ReadingSessionDao
}
