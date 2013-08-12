/**
 * Copyright Surevine Ltd. 2013
 *
 * The code herein is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The code herein is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = {
  
  app: {
    port: 3000 // port to listen on
  },
  
  polls: {
    github: 60000,  // poll frequency in millis
    blog: 60000     // poll frequency in millis
  },
  
  db: {
    host: '',
    port: '',
    user: '',
    password: '',
    database: '',
    table: ''
  },
  
  twitter: {
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: '',
    follow: ''  // User account ID to follow.
  },
  
  github: {
    username: '', // Account to authenticate Github API with
    password: '',
    organisation: '' // Orgnisation name to poll feed of
  },
  
  blog: {
    title: '', // Blog title, used in activity markup (in header of each activity)
    url: '', // Main URL of blog, used for activity stream target
    feed_url: '', // Feed URL to poll
    author_url: '' // Author URL prefix for author hyperlinks. E.g. http://www.example.com/author/<authorname>
  }
  

  
};
