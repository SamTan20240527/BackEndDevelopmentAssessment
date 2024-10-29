CREATE VIEW product_view AS 
(select concat(category.category,'-',product.product_id) AS product_number_view,
 product.product_description AS product_description,
 (select sum(po.quantity_ordered) from po where (po.product_id = product.product_id)) AS po_ordered_view,
 (select sum(po.quantity_received) from po where (po.product_id = product.product_id)) AS po_received_view 
 from product join category on category.category_id = product.category_id
);