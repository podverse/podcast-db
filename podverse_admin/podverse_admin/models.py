# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.contrib import admin
from django.forms import Textarea, TextInput
from datetime import datetime


class Sequelizemeta(models.Model):
    name = models.CharField(primary_key=True, max_length=255)

    class Meta:
        managed = False
        db_table = 'SequelizeMeta'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=80)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Episodes(models.Model):
    id = models.TextField(primary_key=True)
    mediaurl = models.TextField(db_column='mediaUrl', unique=True, blank=True, null=True)  # Field name made lowercase.
    imageurl = models.TextField(db_column='imageUrl', blank=True, null=True)  # Field name made lowercase.
    title = models.TextField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True)
    link = models.TextField(blank=True, null=True)
    mediabytes = models.IntegerField(db_column='mediaBytes', blank=True, null=True)  # Field name made lowercase.
    mediatype = models.TextField(db_column='mediaType', blank=True, null=True)  # Field name made lowercase.
    pubdate = models.DateTimeField(db_column='pubDate', blank=True, null=True)  # Field name made lowercase.
    ispublic = models.NullBooleanField(db_column='isPublic')  # Field name made lowercase.
    pasthourtotaluniquepageviews = models.IntegerField(db_column='pastHourTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    pastdaytotaluniquepageviews = models.IntegerField(db_column='pastDayTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    pastweektotaluniquepageviews = models.IntegerField(db_column='pastWeekTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    pastmonthtotaluniquepageviews = models.IntegerField(db_column='pastMonthTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    pastyeartotaluniquepageviews = models.IntegerField(db_column='pastYearTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    alltimetotaluniquepageviews = models.IntegerField(db_column='allTimeTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    datecreated = models.DateTimeField(db_column='dateCreated')  # Field name made lowercase.
    lastupdated = models.DateTimeField(db_column='lastUpdated')  # Field name made lowercase.
    podcastid = models.ForeignKey('Podcasts', models.DO_NOTHING, db_column='podcastId', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'episodes'


class Feedurls(models.Model):
    url = models.TextField(primary_key=True)
    isauthority = models.NullBooleanField(db_column='isAuthority')  # Field name made lowercase.
    datecreated = models.DateTimeField(default=datetime.now, db_column='dateCreated')  # Field name made lowercase.
    lastupdated = models.DateTimeField(default=datetime.now, db_column='lastUpdated')  # Field name made lowercase.
    podcastid = models.ForeignKey('Podcasts', models.DO_NOTHING, db_column='podcastId', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'feedUrls'
        verbose_name_plural = 'FeedUrls'


class Mediarefs(models.Model):
    id = models.TextField(primary_key=True)
    starttime = models.IntegerField(db_column='startTime')  # Field name made lowercase.
    endtime = models.IntegerField(db_column='endTime', blank=True, null=True)  # Field name made lowercase.
    title = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    ownerid = models.TextField(db_column='ownerId', blank=True, null=True)  # Field name made lowercase.
    ownername = models.TextField(db_column='ownerName', blank=True, null=True)  # Field name made lowercase.
    datecreated = models.DateTimeField(db_column='dateCreated', blank=True, null=True)  # Field name made lowercase.
    lastupdated = models.DateTimeField(db_column='lastUpdated', blank=True, null=True)  # Field name made lowercase.
    podcasttitle = models.TextField(db_column='podcastTitle', blank=True, null=True)  # Field name made lowercase.
    podcastfeedurl = models.TextField(db_column='podcastFeedUrl')  # Field name made lowercase.
    podcastimageurl = models.TextField(db_column='podcastImageUrl', blank=True, null=True)  # Field name made lowercase.
    episodetitle = models.TextField(db_column='episodeTitle', blank=True, null=True)  # Field name made lowercase.
    episodemediaurl = models.TextField(db_column='episodeMediaUrl')  # Field name made lowercase.
    episodeimageurl = models.TextField(db_column='episodeImageUrl', blank=True, null=True)  # Field name made lowercase.
    episodelinkurl = models.TextField(db_column='episodeLinkUrl', blank=True, null=True)  # Field name made lowercase.
    episodepubdate = models.DateTimeField(db_column='episodePubDate', blank=True, null=True)  # Field name made lowercase.
    episodesummary = models.TextField(db_column='episodeSummary', blank=True, null=True)  # Field name made lowercase.
    episodeduration = models.IntegerField(db_column='episodeDuration', blank=True, null=True)  # Field name made lowercase.
    pasthourtotaluniquepageviews = models.IntegerField(db_column='pastHourTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    pastdaytotaluniquepageviews = models.IntegerField(db_column='pastDayTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    pastweektotaluniquepageviews = models.IntegerField(db_column='pastWeekTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    pastmonthtotaluniquepageviews = models.IntegerField(db_column='pastMonthTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    pastyeartotaluniquepageviews = models.IntegerField(db_column='pastYearTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    alltimetotaluniquepageviews = models.IntegerField(db_column='allTimeTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    ispublic = models.NullBooleanField(db_column='isPublic')  # Field name made lowercase.
    podcastid = models.TextField(db_column='podcastId', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'mediaRefs'


class Playlistitems(models.Model):
    datecreated = models.DateTimeField(db_column='dateCreated')  # Field name made lowercase.
    lastupdated = models.DateTimeField(db_column='lastUpdated')  # Field name made lowercase.
    playlistid = models.ForeignKey('Playlists', models.DO_NOTHING, db_column='playlistId', primary_key=True)  # Field name made lowercase.
    mediarefid = models.ForeignKey(Mediarefs, models.DO_NOTHING, db_column='mediaRefId')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'playlistItems'
        unique_together = (('playlistid', 'mediarefid'),)


class Playlists(models.Model):
    id = models.TextField(primary_key=True)
    slug = models.TextField(unique=True, blank=True, null=True)
    title = models.TextField()
    ownerid = models.TextField(db_column='ownerId')  # Field name made lowercase.
    ownername = models.TextField(db_column='ownerName', blank=True, null=True)  # Field name made lowercase.
    datecreated = models.DateTimeField(db_column='dateCreated', blank=True, null=True)  # Field name made lowercase.
    lastupdated = models.DateTimeField(db_column='lastUpdated', blank=True, null=True)  # Field name made lowercase.
    isrecommendation = models.NullBooleanField(db_column='isRecommendation')  # Field name made lowercase.
    ismyclips = models.NullBooleanField(db_column='isMyClips')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'playlists'


class Podcasts(models.Model):
    id = models.TextField(primary_key=True)
    imageurl = models.TextField(db_column='imageUrl', blank=True, null=True)  # Field name made lowercase.
    summary = models.TextField(blank=True, null=True)
    title = models.TextField(blank=True, null=True)
    author = models.TextField(blank=True, null=True)
    lastbuilddate = models.DateTimeField(db_column='lastBuildDate', blank=True, null=True)  # Field name made lowercase.
    lastpubdate = models.DateTimeField(db_column='lastPubDate', blank=True, null=True)  # Field name made lowercase.
    lastepisodetitle = models.TextField(db_column='lastEpisodeTitle', blank=True, null=True)  # Field name made lowercase.
    totalavailableepisodes = models.IntegerField(db_column='totalAvailableEpisodes', blank=True, null=True)  # Field name made lowercase.
    categories = models.TextField(blank=True, null=True)  # This field type is a guess.
    pasthourtotaluniquepageviews = models.IntegerField(db_column='pastHourTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    pastdaytotaluniquepageviews = models.IntegerField(db_column='pastDayTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    pastweektotaluniquepageviews = models.IntegerField(db_column='pastWeekTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    pastmonthtotaluniquepageviews = models.IntegerField(db_column='pastMonthTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    pastyeartotaluniquepageviews = models.IntegerField(db_column='pastYearTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    alltimetotaluniquepageviews = models.IntegerField(db_column='allTimeTotalUniquePageviews', blank=True, null=True)  # Field name made lowercase.
    datecreated = models.DateTimeField(default=datetime.now, db_column='dateCreated')  # Field name made lowercase.
    lastupdated = models.DateTimeField(default=datetime.now, db_column='lastUpdated')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'podcasts'
        verbose_name_plural = 'Podcasts'
        

class FeedUrlsAdminInline(admin.TabularInline):
    model = Feedurls
    fields = ('url', 'isauthority')
    formfield_overrides = {
        models.TextField: {'widget': TextInput(attrs={'size': 100})}
    }
    extra = 0

class PodcastsAdmin(admin.ModelAdmin):
    formfield_overrides = {
        models.TextField: {'widget': TextInput(attrs={'size': 100})}
    }
    fields = ('title', 'id', 'imageurl', 'summary', 'author')
    list_display = ('title', 'id')
    search_fields = ('title', 'id')
    inlines = (FeedUrlsAdminInline, )

    class Meta:
        verbose_name_plural = 'Pod'


class Subscribedplaylists(models.Model):
    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.
    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='userId', primary_key=True)  # Field name made lowercase.
    playlistid = models.ForeignKey(Playlists, models.DO_NOTHING, db_column='playlistId')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'subscribedPlaylists'
        unique_together = (('userid', 'playlistid'),)


class Users(models.Model):
    id = models.CharField(primary_key=True, max_length=255)
    name = models.TextField(blank=True, null=True)
    nickname = models.TextField(blank=True, null=True)
    subscribedpodcastids = models.TextField(db_column='subscribedPodcastIds', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.
    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'users'
