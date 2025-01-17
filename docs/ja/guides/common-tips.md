## 一般的なヒント

### 何をテストするかを知る

UI コンポーネントでは、コンポーネントの内部実装の詳細に集中しすぎて脆弱なテストが発生する可能性があるため、完全なラインベースのカバレッジを目指すことはお勧めしません。

代わりに、コンポーネントのパブリックインターフェイスを検証するテストを作成し、内部をブラックボックスとして扱うことをお勧めします。単一のテストケースでは、コンポーネントに提供された入力（ユーザーのやり取りやプロパティの変更）によって、期待される出力（結果の描画またはカスタムイベントの出力）が行われることが示されます。

たとえば、ボタンがクリックされるたびに表示カウンタを 1 ずつインクリメントする `Counter` コンポーネントの場合、そのテストケースはクリックをシミュレートし、描画された出力が 1 つ増加したのか検証します。カウンタは値をインクリメントし、入力と出力のみを扱います。

このアプローチの利点は、コンポーネントのパブリックインターフェイスが同じままである限り、コンポーネントの内部実装が時間の経過とともにどのように変化してもテストは合格になります。

このトピックは、[Matt O'Connell による偉大なプレゼンテーション](https://www.youtube.com/watch?v=OIpfWTThrK8)で詳細に説明されています。

### Shallow 描画

単体テストでは、通常、単体テストとしてテスト対象のコンポーネントに焦点を当て、子コンポーネントの動作を間接的に検証することを避けたいと考えています。

さらに、多くの子コンポーネントを含むコンポーネントの場合、描画されたツリー全体が非常に大きくなる可能性があります。すべての子コンポーネントを繰り返し描画すると、テストが遅くなる可能性があります。

`vue-test-utils` を使うと、`shallowMount` メソッドを使って子コンポーネントを（スタブによって）描画せずにコンポーネントをマウントすることができます：

```js
import { shallowMount } from 'vue2-test-utils'

const wrapper = shallowMount(Component) // Component インスタンスを含む Wrapper を返します。
wrapper.vm // マウントされた Vue インスタンス
```

### イベントの発行を検証する

マウントされた各ラッパは、基になる Vue インスタンスによって発行されたすべてのイベントを自動的に記録します。`wrapper.emitted()` を使って、記録されたイベントを取り出すことができます:

```js
wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
wrapper.emitted()は次のオブジェクトを返します:
{
  foo: [[], [123]]
}
*/
```

次に、これらのデータに基づいて検証することもできます。

```js
// イベントが発行されたか検証する
expect(wrapper.emitted().foo).toBeTruthy()

// イベント数を検証する
expect(wrapper.emitted().foo.length).toBe(2)

// イベントのペイロードを検証する
expect(wrapper.emitted().foo[1]).toEqual([123])
```

また、[wrapper.emittedByOrder()](../api/wrapper/emittedByOrder.md) を呼び出すことで、発行順序のイベントの配列を取得することもできます。

### コンポーネントの状態を操作する

ラッパの `setData` メソッドまたは `setProps` メソッドを使って、コンポーネントの状態を直接操作することができます。:

```js
it('manipulates state', async () => {
  await wrapper.setData({ count: 10 })

  await wrapper.setProps({ foo: 'bar' })
})
```

### プロパティをモックする

Vue に組み込まれた `propsData` オプションを使用してコンポーネントにプロパティを渡すことができます:

```js
import { mount } from 'vue2-test-utils'

mount(Component, {
  propsData: {
    aProp: 'some value'
  }
})
```

`wrapper.setProps({})` メソッドを使用して、すでにマウントされているコンポーネントのプロパティを更新することもできます。

_オプションの完全なリストについては、ドキュメントの[マウントオプションのセクション](../api/options.md)を参照してください。_

### グローバルプラグインとミックスインの適用

コンポーネントの中には、グローバルプラグインやミックスインによって注入された機能 (例: `vuex`、`vue-router` など)に依存するものもあります。

特定のアプリケーションでコンポーネントのテストを作成している場合は、同じグローバルプラグインとミックスインをテストのエントリに設定できます。しかし、異なるアプリケーション間で共有される可能性のあるジェネリックコンポーネントスイートをテストする場合など、グローバルな `Vue` コンストラクタを汚染することなく、より孤立した設定でコンポーネントをテストする方が良い場合もあります。[createLocalVue](../api/createLocalVue.md) メソッドを使用すると、次のことができます:

```js
import { createLocalVue } from 'vue2-test-utils'

// 拡張された Vue コンストラクタを作成する
const localVue = createLocalVue()

// プラグインをインストールする
localVue.use(MyPlugin)

// localVue をマウントオプションに渡す
mount(Component, {
  localVue
})
```

**Vue Router のようなプラグインはグローバルの Vue コンストラクタに read-only なプロパティを追加します。  
これは localVue コンストラクタにそのプラグインを再びインストールすることや read-only なプロパティに対するモックを追加することを不可能にします。**

### モックの注入

単純なモックを注入するための別の戦略として `mocks` オプションで行うことができます:

```js
import { mount } from 'vue2-test-utils'

const $route = {
  path: '/',
  hash: '',
  params: { id: '123' },
  query: { q: 'hello' }
}

mount(Component, {
  mocks: {
    $route // コンポーネントをマウントする前に、モックした $route オブジェクトを Vue インスタンスに追加します。
  }
})
```

### スタブコンポーネント

`stubs` オプションを使用して、グローバルまたはローカルに登録されたコンポーネントを上書きできます:

```js
import { mount } from 'vue2-test-utils'

mount(Component, {
  // globally-registered-component を空のスタブとして
  // 解決します
  stubs: ['globally-registered-component']
})
```

### ルーティングの扱い

定義によるルーティングは、アプリケーションの全体的な構造と関連し、複数のコンポーネントが関係するため、統合テストまたはエンドツーエンドテストによってよくテストされます。
`vue-router` 機能に依存する個々のコンポーネントについては、上記の手法を使ってモックすることができます。

### スタイルの検知

`jsdom`を使う場合、テスト対象として検知できるのはインラインで書かれたスタイルだけです。
