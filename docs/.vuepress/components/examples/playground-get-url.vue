<template>
  <div>
    <VuepressApiPlayground
      url="https://jsonplaceholder.typicode.com/posts/{id}"
      method="get"
      :showURL="true"
      :data="[
        {
          name: 'id',
          value: '1',
          type: 'number',
        },
      ]"
    />
  </div>
</template>