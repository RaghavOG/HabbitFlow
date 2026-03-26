import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistReducer, persistStore } from "redux-persist"
import storage from "redux-persist/lib/storage"
import dashboardReducer from "@/lib/redux/dashboardSlice"

const rootReducer = combineReducers({
  dashboard: dashboardReducer,
})

export type RootState = ReturnType<typeof rootReducer>

const persistConfig = {
  key: "hf_root",
  storage,
  whitelist: ["dashboard"],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // These checks can be noisy with redux-persist.
      serializableCheck: false,
    }),
})

export type AppDispatch = typeof store.dispatch

export const persistor = persistStore(store)

