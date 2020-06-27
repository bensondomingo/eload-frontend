<template>
  <nav>
    <v-app-bar app clipped-left dark color="#2a9d8f">
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>
        <span class="font-weight-light">Load</span>
        <span class="font-weight-bold">Ninja</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-menu offset-y v-if="isAuthenticated">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="item in menu" :key="item.id" @click="onMenuClick(item.id)">
            <v-list-item-icon class="mr-2">
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer app v-model="drawer" clipped>
      <v-list nav>
        <v-list-item>
          <v-list-item-avatar>
            <v-img src="https://randomuser.me/api/portraits/men/78.jpg"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>John Leider</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item v-for="(item, index) in filteredItems" :key="index" :to="item.route">
          <v-list-item-icon>
            <v-icon class="mr-0" v-text="item.icon"></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.text"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'Navbar',
  data() {
    return {
      drawer: false,
      item: 0,
      items: [
        {
          text: 'Dashboard',
          icon: 'mdi-view-dashboard',
          route: { path: '/' }
        },
        {
          text: 'Login',
          icon: 'mdi-account-circle',
          route: { path: '/auth/login' }
        }
      ],
      menu: [
        {
          id: 'profile',
          title: 'Profile',
          icon: 'mdi-account-circle'
        },
        {
          id: 'signout',
          title: 'Sign out',
          icon: 'mdi-account-arrow-right'
        }
      ]
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated']),

    filteredItems() {
      return this.items.filter(item =>
        (this.isAuthenticated && item.text == 'Login') ||
        (!this.isAuthenticated && item.text == 'Logout')
          ? false
          : true
      );
    }
  },

  methods: {
    onMenuClick(menuId) {
      switch (menuId) {
        case 'signout':
          this.$emit('logout');
          break;

        default:
          break;
      }
    }
  }
};
</script>

<style></style>
