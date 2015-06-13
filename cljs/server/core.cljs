(ns server.core 
  (:require [cljs.nodejs :as node]))

(enable-console-print!)

(def panda-keys (node/require "../../config/panda-config.js"))
(def places (let [GooglePlaces (node/require "google-places")]
              (GooglePlaces. (aget panda-keys "googleMap" "map"))))

(defn getApiData [this-restaurant callback]
  (let [loc [(.-latitude this-restaurant) (.-longitude this-restaurant)]]
    (get-google-places-info (.-name this-restaurant) loc callback)))

(defn get-google-places-info [current-biz-name loc callback]
  (println "inside google places")
  (println #js {:keyword current-biz-name :location loc :radius "1"})
  (.search places
           #js {:keyword current-biz-name :location loc :radius "1"}
           (fn [err response]
             (println "there was a response")
             (if err
               (do
                 (println "google places error")
                 (println err))
               (println response)))))






(defn noop [] nil)
(set! *main-cli-fn* noop)
