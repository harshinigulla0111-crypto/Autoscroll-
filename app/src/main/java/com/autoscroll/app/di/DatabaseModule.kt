package com.autoscroll.app.di

import android.content.Context
import androidx.room.Room
import com.autoscroll.app.data.local.AutoScrollDatabase
import com.autoscroll.app.data.local.ReadingSessionDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AutoScrollDatabase {
        return Room.databaseBuilder(
            context,
            AutoScrollDatabase::class.java,
            "autoscroll_db"
        ).fallbackToDestructiveMigration().build()
    }

    @Provides
    fun provideReadingSessionDao(database: AutoScrollDatabase): ReadingSessionDao {
        return database.readingSessionDao()
    }
}
