(ns server.core 
  (:require [cljs.nodejs :as node]))

;; (repl/connect "http://localhost:9000/repl")

(enable-console-print!)

(defn noop [] nil)

(defn main []
  (println "Hello world!!!"))

(set! *main-cli-fn* noop)
