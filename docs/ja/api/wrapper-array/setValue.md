## setValue(value)

このメソッドは以下のコードのエイリアスです。

```js
wrapperArray.wrappers.forEach(wrapper => wrapper.setValue(value))
```

- **引数:**

  - `{any} value`

- **例:**

```js
import { mount } from 'vue2-test-utils'

const wrapper = mount({
  data() {
    return {
      t1: '',
      t2: ''
    }
  },
  template: `
    <div>
      <input type="text" name="t1" class="foo" v-model="t1" />
      <input type="text" name="t2" class="foo" v-model="t2"/>
    </div>`
})

test('setValue demo', async () => {
  const wrapperArray = wrapper.findAll('.foo')
  expect(wrapper.vm.t1).toEqual('')
  expect(wrapper.vm.t2).toEqual('')
  await wrapperArray.setValue('foo')
  expect(wrapper.vm.t1).toEqual('foo')
  expect(wrapper.vm.t2).toEqual('foo')
})
```
