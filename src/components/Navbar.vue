<template>
  <nav>
    <v-app-bar app clipped-left dark color="#2a9d8f">
      <v-app-bar-nav-icon v-on:click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <span class="font-weight-light">Load</span>
        <span class="font-weight-bold">Ninja</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text>
        Sign Out
        <v-icon right>mdi-exit-to-app</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer app v-model="drawer" clipped>
      <v-list>
        <v-list-item class="profile">
          <v-list-item-avatar>
            <v-img src="https://randomuser.me/api/portraits/men/78.jpg"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>John Leider</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item-group v-model="item" color="primary">
          <v-list-item v-for="(item, index) in items" :key="index" router :to="item.route">
            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.text"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      drawer: false,
      item: 0,
      items: [{ text: 'Dashboard', icon: 'mdi-view-dashboard', route: '/' }]
    };
  }
};
</script>

<style></style>
