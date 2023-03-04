<template>
  <div class="vp-playground">
    <component :is="'h4'" class="vp-playground__method" v-if="showMethod">
      Method: <Badge type="warn" :text="method.toUpperCase()" vertical="unset" />
    </component>
    <component :is="'h4'" class="vp-playground__url" v-if="showURL">
      URL: <code style="word-break: break-word;">{{ url }}</code>
    </component>
    <div v-if="headers && Object.keys(headers).length > 0">
      <component :is="'h4'">Headers:</component>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, id) in Object.keys(headers)" :key="`headers-${id}`">
            <td>{{ item }}</td>
            <td>
              <input
                @enter="request"
                v-model="headers[item]"
                type="text" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <component :is="'h4'">Data:</component>
    <table v-if="inputData && inputData.length > 0">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, id) in inputData" :key="`data-${id}`">
          <td>{{ item.name }}</td>
          <td>
            <input
              @enter="request"
              v-model="item.value"
              :type="item.type" />
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="request()" :disabled="loading">
      <span v-if="!loading">Execute</span>
      <span v-else>Loading</span>
    </button>
    <div class="vp-playground__response" v-if="response.text">
      <span class="vp-playground__status" v-if="response.code">
        Status:
        <Badge
          :type="response.code < 300 ? 'tip' : 'error'"
          :text="`${response.code}`"
          vertical="unset" />
      </span>
      <div class="language- extra-class">
        <pre class="language-text"><code>{{ response.text }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'vuepress-api-playground',
  data() {
    return {
      loading: false,
      inputData: [],
      response: {
        text: null,
        code: null,
      },
    };
  },
  props: {
    url: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    data: {
      type: Array,
      required: false,
    },
    showMethod: {
      type: Boolean,
      required: false,
      default: false,
    },
    showURL: {
      type: Boolean,
      required: false,
      default: false,
    },
    headers: {
      type: Object,
      required: false,
      default: null,
    },
  },
  mounted() {
    this.inputData = [...this.data];
  },
  methods: {
    clearResponseData() {
      this.response = {
        text: null,
        code: null,
      };
    },
    getRequestData() {
      if (this.inputData) {
        const result = {};
        this.inputData.forEach((item) => {
          try {
            result[item.name] = JSON.parse(item.value);
          } catch {
            if (item.value !== '') {
              result[item.name] = item.value;
            }
          }
        });
        return result;
      }
      return null;
    },
    getRequestParams() {
      const requestData = this.getRequestData();
      let { url } = this;
      const method = this.method.toLowerCase();
      let data = {
        method,
      };
      const urlMatch = url.match(/<([a-zA-Z_]+)>/g);
      if (urlMatch) {
        urlMatch.forEach((element) => {
          url = url.replace(element, requestData[element.slice(1, -1)]);
          delete requestData[element.slice(1, -1)];
        });
      }
      if (requestData) {
        if (method === 'post' || method === 'put' || method === 'patch') {
          const headers = this.headers || {
            'Content-Type': 'application/json',
          };
          data = Object.assign(data, {
            headers,
            body: JSON.stringify(requestData),
          });
        } else {
          url = `${url}?${new URLSearchParams(requestData).toString()}`;
        }
      }
      return {
        url,
        data,
      };
    },
    request() {
      const requestParams = this.getRequestParams();
      this.clearResponseData();
      this.loading = true;
      fetch(requestParams.url, requestParams.data)
        .then((response) => {
          this.loading = false;
          this.response.code = response.status ? response.status : null;
          return response.json();
        })
        .then((result) => {
          this.response.text = result;
        })
        .catch((error) => {
          this.loading = false;
          this.response.text = error;
        });
    },
  },
};
</script>
