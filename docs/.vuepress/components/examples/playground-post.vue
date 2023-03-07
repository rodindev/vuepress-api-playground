<template>
  <div>
    <VuepressApiPlayground url="https://jsonplaceholder.typicode.com/posts"
      method="post"
      :data="[
        {
          name: 'title',
          value: 'Title',
          type: 'text',
        },
        {
          name: 'body',
          value: 'Body',
          type: 'text',
        },
        {
          name: 'userId',
          value: '1',
          type: 'number',
        },
      ]"
    />
  </div>
</template>