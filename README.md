# RNBase

This project is a [React Native](https://reactnative.dev) boilerplate that can be used to kick-start a mobile application.

The boilerplate provides an architecture optimized for building solid cross-platform mobile applications through separation of concerns between UI and business logic.

<p align="center">
  <img src="https://i.ibb.co/YZPPyXq/icon-Android.png" width="200">
</p>

## Outstanding Features

- Fully support `tailwindcss` to make coding styles for components become neater and simpler than ever
- State management with `redux-toolkit`, with the aim of keeping the code syntax concise and optimized
- Clean and easy to manage folder structure with the separation of `screens, store & navigators`
- Support `Type declarations` through the app (for state, screen names, icon names, assets, components, ...)
- Use `theme` manager (from react-navigation) and apply `multi-language` (i18next)
- Simple, light and complete set of `Basic components`: Button, DateTimePicker, Icon, Image, Input, Modal, Picker, Text, View,...
- Easily handle requests with the server using `Axios` and `hooks`: useRequest (for basic request), useListRequest (support pagination), useMutation (for post, patch, put, delete request)
- `Multi-environment` support: development, staging and production
- Quickly create `logo & splash screen` by updating the files "iconAndroid.png", "iconIos.png", "splash.png" in "/assets/images/app" and running the command `yarn make:icon & yarn make:splash`
- Use `Fastlane` to automatically deploy app to staging env (Firebase App Distribution) and production env (AppStore, PlayStore)
- ~90% unit test coverage with `jest & @testing-library`
- List of `code snippets` to help you code faster with VSCode

## Folder structure

```
├── ...
├── __mocks__/
├── __tests__/
├── android/
├── ios/
├── src/
│   ├── app/
│   │   ├── app.container.tsx
│   │   ├── app.navigator.tsx
│   │   ├── index.tsx
│   ├── assets/
│   │   ├── fonts/
│   │   ├── icons/
│   │   ├── images/
│   ├── components/
│   │   ├── common/
│   │   ├── custom/
│   │   ├── hoc/
│   │   ├── hooks/
│   ├── containers/
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   ├── ...
│   │   ├── routes/
│   │   │   ├── Auth/
│   │   │   ├── Main/
│   │   │   ├── Modal/
│   │   │   ├── ...
│   │   ├── screens/
│   │   │   ├── Auth/
│   │   │   ├── Main/
│   │   │   ├── Modal/
│   │   │   ├── ...
│   │   ├── store/
│   │   │   ├── auth.ts
│   │   │   ├── config.ts
│   │   │   ├── ...
│   ├── core/
│   │   ├── configs/
│   │   │   ├── i18n.ts
│   │   │   ├── reducer.ts
│   │   │   ├── store.ts
│   │   ├── plugins/
│   │   │   ├── Notification.ts
│   │   │   ├── ...
│   │   ├── themes/
│   │   │   ├── DarkColor.ts
│   │   │   ├── DefaultColor.ts
│   │   ├── utils/
│   │   │   ├── Api.ts
│   │   │   ├── AppHelper.ts
│   │   │   ├── AppView.ts
│   │   │   ├── Helper.ts
│   │   │   ├── Navigation.ts
│   │   │   ├── Redux.ts
│   │   ├── validators/
│   │   │   ├── index.ts
└── ...
```

## Installation

```
yarn
```

```
=> Copy ".env.example" to ".env", ".env.staging" & ".env.production"
```

## Local Development

This starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

- Android

```
yarn android
```

- iOS

```
yarn ios
```

### Multi-environment run

- Android

```
yarn android:stag

yarn android:prod
```

- iOS

```
=> Open "/ios/RNBase.xcworkspace", choose scheme ([DEV] RNBase, [STAG] RNBase, RNBase) to run
```

## Build

This generates static content into the `build` directory and can be served using any static contents hosting service.

- Android

```
android-build:stag
```

```
android-build:prod
```

```
android-build:all
```

- iOS

```
=> Open "/ios/RNBase.xcworkspace", choose scheme ([STAG] RNBase, RNBase), set target devices to "Any iOS device (arm64)" and select "Product => Archive"
```

### Deployment & Continuous Integration

This boilerplate supports github actions & uses fastlane to deploy the app to test environment (Firebase App Distribution) or production environment on AppStore & PlayStore

```
=> Copy "/android/fastlane/.env.example" to "/android/fastlane/.env" and add the config variables to this file

=> Copy "/ios/fastlane/.env.example" to "/ios/fastlane/.env" and add the config variables to this file
```

### That's it, hope you enjoy the code base 🎉
